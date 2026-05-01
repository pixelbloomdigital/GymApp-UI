package com.pixelbloom.coreService.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyProgressEvent {

    private Long      memberId;
    private String    memberName;
    private String    memberPhone;
    private Long      batchId;
    private String    batchName;
    private String    activityType;   // BatchType enum name
    private LocalDate sessionDate;
    private String    dayOfWeek;      // e.g. "Tuesday"
    private int       caloriesBurnt;

    // Nullable — omitted from message when null
    private Double  todayWeight;
    private Integer heartRate;
    private String  goalSummary;
}
