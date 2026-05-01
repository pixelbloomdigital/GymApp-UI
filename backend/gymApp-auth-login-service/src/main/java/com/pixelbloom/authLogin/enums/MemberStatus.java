package com.pixelbloom.authLogin.enums;

public enum MemberStatus {
    /**
     * Default state when visitor is converted to member.
     * Member can log in but cannot access gym services.
     */
    INACTIVE,

    /**
     * Set by gymApp-core-service once a valid membership payment is confirmed.
     * Member has full access to gym services.
     */
    ACTIVE,

    /**
     * Set by admin — member is temporarily suspended.
     */
    SUSPENDED
}
