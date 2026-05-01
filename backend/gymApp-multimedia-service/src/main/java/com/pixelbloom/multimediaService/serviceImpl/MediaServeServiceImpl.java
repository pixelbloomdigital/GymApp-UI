package com.pixelbloom.multimediaService.serviceImpl;

import com.pixelbloom.multimediaService.entity.MediaAsset;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.exception.MediaAssetGoneException;
import com.pixelbloom.multimediaService.exception.MediaAssetNotFoundException;
import com.pixelbloom.multimediaService.exception.UnauthorizedException;
import com.pixelbloom.multimediaService.repository.MediaAssetRepository;
import com.pixelbloom.multimediaService.service.AccessControlService;
import com.pixelbloom.multimediaService.service.MediaServeService;
import com.pixelbloom.multimediaService.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class MediaServeServiceImpl implements MediaServeService {

    private final MediaAssetRepository mediaAssetRepository;
    private final StorageService storageService;
    private final AccessControlService accessControlService;

    @Override
    public ResponseEntity<Resource> serve(String uniqueFileName, String jwtToken, HttpRange range) {

        // 1. Look up asset
        MediaAsset asset = mediaAssetRepository.findByUniqueFileName(uniqueFileName)
                .orElseThrow(() -> new MediaAssetNotFoundException(
                        "Media asset not found: " + uniqueFileName));

        // 2. Check if deactivated
        if (!asset.isActive()) {
            throw new MediaAssetGoneException(
                    "Media asset has been deactivated: " + uniqueFileName);
        }

        // 3. Access control (PUBLIC passes through; PRIVATE checks token/role/batch)
        if (asset.getVisibility() == Visibility.PRIVATE) {
            boolean allowed = accessControlService.canServe(asset, jwtToken);
            if (!allowed) {
                throw new UnauthorizedException("Access denied to this resource");
            }
        }

        // 4. Load resource
        Resource resource = storageService.load(uniqueFileName)
                .orElseThrow(() -> new MediaAssetNotFoundException(
                        "File not found in storage: " + uniqueFileName));

        MediaType contentType = MediaType.parseMediaType(asset.getMimeType());

        // 5. Handle Range request (video streaming)
        if (range != null) {
            return buildRangeResponse(resource, contentType, range);
        }

        // 6. Full response
        return ResponseEntity.ok()
                .contentType(contentType)
                .body(resource);
    }

    private ResponseEntity<Resource> buildRangeResponse(Resource resource,
                                                         MediaType contentType,
                                                         HttpRange range) {
        try {
            long contentLength = resource.contentLength();
            long start = range.getRangeStart(contentLength);
            long end   = range.getRangeEnd(contentLength);
            long rangeLength = end - start + 1;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(contentType);
            headers.set(HttpHeaders.CONTENT_RANGE,
                    "bytes " + start + "-" + end + "/" + contentLength);
            headers.setContentLength(rangeLength);
            headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");

            // Wrap resource to serve only the requested byte range
            Resource rangeResource = new RangeResource(resource, start, rangeLength);

            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .headers(headers)
                    .body(rangeResource);

        } catch (IOException e) {
            throw new MediaAssetNotFoundException("Unable to read file for range request");
        }
    }

    // -----------------------------------------------------------------------
    // Inner class: wraps a Resource to serve a byte range
    // -----------------------------------------------------------------------

    private static class RangeResource implements Resource {

        private final Resource delegate;
        private final long start;
        private final long length;

        RangeResource(Resource delegate, long start, long length) {
            this.delegate = delegate;
            this.start    = start;
            this.length   = length;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            InputStream is = delegate.getInputStream();
            long skipped = is.skip(start);
            if (skipped < start) {
                throw new IOException("Could not skip to range start " + start);
            }
            return new LimitedInputStream(is, length);
        }

        @Override public boolean exists()                        { return delegate.exists(); }
        @Override public java.net.URL getURL() throws IOException { return delegate.getURL(); }
        @Override public java.net.URI getURI() throws IOException { return delegate.getURI(); }
        @Override public java.io.File getFile() throws IOException { return delegate.getFile(); }
        @Override public long contentLength() throws IOException  { return length; }
        @Override public long lastModified() throws IOException   { return delegate.lastModified(); }
        @Override public Resource createRelative(String relativePath) throws IOException {
            return delegate.createRelative(relativePath);
        }
        @Override public String getFilename()    { return delegate.getFilename(); }
        @Override public String getDescription() { return delegate.getDescription(); }
    }

    private static class LimitedInputStream extends InputStream {
        private final InputStream delegate;
        private long remaining;

        LimitedInputStream(InputStream delegate, long limit) {
            this.delegate  = delegate;
            this.remaining = limit;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) return -1;
            int b = delegate.read();
            if (b != -1) remaining--;
            return b;
        }

        @Override
        public int read(byte[] buf, int off, int len) throws IOException {
            if (remaining <= 0) return -1;
            int toRead = (int) Math.min(len, remaining);
            int n = delegate.read(buf, off, toRead);
            if (n > 0) remaining -= n;
            return n;
        }

        @Override
        public void close() throws IOException { delegate.close(); }
    }
}
