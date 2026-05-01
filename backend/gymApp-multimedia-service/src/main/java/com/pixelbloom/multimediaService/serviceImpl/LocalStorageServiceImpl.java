package com.pixelbloom.multimediaService.serviceImpl;

import com.pixelbloom.multimediaService.exception.StorageUnavailableException;
import com.pixelbloom.multimediaService.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageServiceImpl implements StorageService {

    private final Path uploadDir;

    public LocalStorageServiceImpl(@Value("${storage.local.upload-dir:./uploads}") String uploadDirPath) {
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new StorageUnavailableException("Could not create upload directory: " + e.getMessage());
        }
    }

    @Override
    public String store(MultipartFile file) {
        if (!isHealthy()) {
            throw new StorageUnavailableException("Storage backend is unavailable");
        }
        String originalName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                : "file";
        String uniqueFileName = UUID.randomUUID() + "-" + originalName;
        try {
            Path targetPath = uploadDir.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return uniqueFileName;
        } catch (IOException e) {
            throw new StorageUnavailableException("Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public Optional<Resource> load(String uniqueFileName) {
        try {
            Path filePath = uploadDir.resolve(uniqueFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return Optional.of(resource);
            }
            return Optional.empty();
        } catch (MalformedURLException e) {
            return Optional.empty();
        }
    }

    @Override
    public boolean isHealthy() {
        return Files.exists(uploadDir) && Files.isWritable(uploadDir);
    }
}
