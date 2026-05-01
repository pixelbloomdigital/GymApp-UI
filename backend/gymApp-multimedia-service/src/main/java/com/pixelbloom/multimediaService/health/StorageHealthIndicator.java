package com.pixelbloom.multimediaService.health;

import com.pixelbloom.multimediaService.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StorageHealthIndicator implements HealthIndicator {

    private final StorageService storageService;

    @Override
    public Health health() {
        if (storageService.isHealthy()) {
            return Health.up().withDetail("storage", "available").build();
        }
        return Health.down().withDetail("storage", "unavailable or not writable").build();
    }
}
