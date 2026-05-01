package com.pixelbloom.coreService.service;

public interface CalorieEstimationService {

    /**
     * Estimates calories burnt for a session.
     *
     * @param activityType batch activity type name (e.g. "ZUMBA")
     * @param timeSlot     batch time slot in format "HH:mm-HH:mm" (e.g. "06:00-07:00")
     * @return total kilocalories burnt, always > 0
     */
    int estimateCalories(String activityType, String timeSlot);
}
