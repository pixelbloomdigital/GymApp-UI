package com.pixelbloom.authLogin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.authLogin.entity.Visitor;
import com.pixelbloom.authLogin.repository.VisitorRepository;
import com.pixelbloom.authLogin.requestdto.CompleteProfileRequest;
import com.pixelbloom.authLogin.responsedto.VisitorRegisterResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final VisitorRepository visitorRepository;
    private final ObjectMapper objectMapper;

    /**
     * Called by frontend after Google OAuth2 login when isNewVisitor=true.
     * Google only provides name + email — phone, gymCenter and preferredBatches
     * must be collected from the user and submitted here.
     *
     * Auth: Bearer token received from OAuth2SuccessHandler JSON response.
     */
    @PatchMapping("/complete-profile")
    @PreAuthorize("hasRole('VISITOR')")
    public ResponseEntity<VisitorRegisterResponse> completeProfile(
            @RequestParam Long visitorId,
            @RequestBody CompleteProfileRequest request) {

        Visitor visitor = visitorRepository.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor not found: " + visitorId));

        if (request.getPhone() != null)     visitor.setPhone(request.getPhone());
        if (request.getGymCenter() != null) visitor.setGymCenter(request.getGymCenter());

        if (request.getPreferredBatches() != null && !request.getPreferredBatches().isEmpty()) {
            try {
                visitor.setPreferredBatchesJson(
                        objectMapper.writeValueAsString(request.getPreferredBatches()));
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize preferredBatches", e);
            }
        }

        visitorRepository.save(visitor);

        return ResponseEntity.ok(VisitorRegisterResponse.builder()
                .visitorId(visitor.getVisitorId())
                .status("VISITOR")
                .name(visitor.getName())
                .email(visitor.getEmail())
                .phone(visitor.getPhone())
                .gymCenter(visitor.getGymCenter())
                .preferredBatches(request.getPreferredBatches())
                .build());
    }

    /** Called when Google OAuth2 fails (user denied access, etc.) */
    @GetMapping("/failure")
    public ResponseEntity<Map<String, String>> oauthFailure() {
        return ResponseEntity.status(401)
                .body(Map.of("error", "Google login failed or was cancelled"));
    }

    /**
     * Called by frontend before redirecting to Google.
     * Stores mode (login|register) in session so OAuth2SuccessHandler can read it.
     */
    @PostMapping("/set-mode")
    public ResponseEntity<Void> setMode(@RequestParam String mode,
                                         jakarta.servlet.http.HttpServletRequest request) {
        request.getSession(true).setAttribute("oauth2_mode", mode);
        return ResponseEntity.ok().build();
    }
}
