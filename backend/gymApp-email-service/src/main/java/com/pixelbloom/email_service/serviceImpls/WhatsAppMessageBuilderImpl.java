package com.pixelbloom.email_service.serviceImpls;

import com.pixelbloom.email_service.event.DailyProgressEventDto;
import com.pixelbloom.email_service.service.WhatsAppMessageBuilder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class WhatsAppMessageBuilderImpl implements WhatsAppMessageBuilder {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH);

    @Override
    public String buildDailyUpdateMessage(DailyProgressEventDto event) {
        StringBuilder sb = new StringBuilder();

        // Greeting + date line
        sb.append("Hi ").append(event.getMemberName()).append("!  Here's your daily fitness update:\n");
        sb.append("📅 ").append(event.getDayOfWeek()).append(", ")
          .append(event.getSessionDate().format(DATE_FMT)).append("\n");

        sb.append("\n");

        // Batch and calories (always present)
        sb.append("🏋️ Batch: ").append(event.getBatchName())
          .append(" (").append(event.getActivityType()).append(")\n");
        sb.append("🔥 Calories Burnt: ~").append(event.getCaloriesBurnt()).append(" kcal\n");

        // Optional fields — only appended when non-null
        if (event.getTodayWeight() != null) {
            sb.append("⚖️ Weight: ").append(event.getTodayWeight()).append(" kg\n");
        }
        if (event.getHeartRate() != null) {
            sb.append("❤️ Heart Rate: ").append(event.getHeartRate()).append(" bpm\n");
        }
        if (event.getGoalSummary() != null && !event.getGoalSummary().isBlank()) {
            sb.append(event.getGoalSummary()).append("\n");
        }

        sb.append("\nKeep it up — every session counts! 🌟");

        return sb.toString();
    }
}
