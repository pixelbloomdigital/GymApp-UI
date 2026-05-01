package com.pixelbloom.email_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyProgressEventDto {

    private Long      memberId;
    private String    memberName;
    private String    memberPhone;
    private Long      batchId;
    private String    batchName;
    private String    activityType;
    private LocalDate sessionDate;
    private String    dayOfWeek;
    private int       caloriesBurnt;

    // Nullable — omitted from message when null
    private Double  todayWeight;
    private Integer heartRate;
    private String  goalSummary;
}
