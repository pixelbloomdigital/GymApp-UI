package com.pixelbloom.coreService.responseDto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalMembers;
    private long activeMembers;
    private BigDecimal todayCollection;
    private long activeMemerships;
    private long expiredMemberships;
}
