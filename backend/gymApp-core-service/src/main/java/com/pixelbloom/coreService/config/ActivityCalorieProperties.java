package com.pixelbloom.coreService.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "activity.calories")
public class ActivityCalorieProperties {

    /** Activity type name → kcal per hour (e.g. ZUMBA=200) */
    private Map<String, Integer> map = new HashMap<>();

    /** Fallback when activityType is not in the map */
    private int defaultCaloriesPerHour = 100;
}
