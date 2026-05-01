package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.config.ActivityCalorieProperties;
import com.pixelbloom.coreService.service.CalorieEstimationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalorieEstimationServiceImpl implements CalorieEstimationService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private final ActivityCalorieProperties calorieProperties;

    @Override
    public int estimateCalories(String activityType, String timeSlot) {
        int caloriesPerHour = resolveCaloriesPerHour(activityType);
        double durationHours = parseDurationHours(timeSlot);
        int result = (int) Math.round(caloriesPerHour * durationHours);
        return Math.max(result, 1); // always positive
    }

    private int resolveCaloriesPerHour(String activityType) {
        if (activityType == null) {
            log.warn("activityType is null — using default {} kcal/hr", calorieProperties.getDefaultCaloriesPerHour());
            return calorieProperties.getDefaultCaloriesPerHour();
        }
        Integer mapped = calorieProperties.getMap().get(activityType.toUpperCase());
        if (mapped == null) {
            log.warn("activityType '{}' not found in calorie map — using default {} kcal/hr",
                    activityType, calorieProperties.getDefaultCaloriesPerHour());
            return calorieProperties.getDefaultCaloriesPerHour();
        }
        return mapped;
    }

    private double parseDurationHours(String timeSlot) {
        if (timeSlot == null || !timeSlot.contains("-")) {
            log.warn("Invalid timeSlot '{}' — defaulting to 1 hour", timeSlot);
            return 1.0;
        }
        try {
            String[] parts = timeSlot.split("-");
            LocalTime start = LocalTime.parse(parts[0].trim(), TIME_FMT);
            LocalTime end   = LocalTime.parse(parts[1].trim(), TIME_FMT);
            long minutes = ChronoUnit.MINUTES.between(start, end);
            if (minutes <= 0) {
                log.warn("timeSlot '{}' has non-positive duration — defaulting to 1 hour", timeSlot);
                return 1.0;
            }
            return minutes / 60.0;
        } catch (Exception e) {
            log.warn("Failed to parse timeSlot '{}': {} — defaulting to 1 hour", timeSlot, e.getMessage());
            return 1.0;
        }
    }
}
