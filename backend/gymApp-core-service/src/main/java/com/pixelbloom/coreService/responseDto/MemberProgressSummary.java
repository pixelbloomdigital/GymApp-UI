package com.pixelbloom.coreService.responseDto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MemberProgressSummary {

    /** Latest weight logged today (null if not logged today) */
    private Double todayWeight;

    /** Latest heart rate logged today (null if not logged today) */
    private Integer heartRate;

    /** Short goal summary string, e.g. "Goal: Lose 5 kg by June 2026" (null if no active goal) */
    private String goalSummary;
}
