package com.pixelbloom.coreService.enums;

public enum AttendanceReviewStatus {
    AUTO_FINALIZED,   // confidence >= 0.85, no review needed
    PENDING_REVIEW,   // confidence < 0.85, awaiting trainer action
    REVIEWED          // trainer confirmed or overrode the AI suggestion
}
