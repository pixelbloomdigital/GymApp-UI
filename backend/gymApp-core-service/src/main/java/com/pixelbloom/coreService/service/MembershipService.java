package com.pixelbloom.coreService.service;

import com.pixelbloom.coreService.requestDto.AssignMembershipRequest;
import com.pixelbloom.coreService.requestDto.PaymentCallbackRequest;
import com.pixelbloom.coreService.requestDto.RenewMembershipRequest;
import com.pixelbloom.coreService.responseDto.MembershipResponse;

import java.util.List;
import java.util.Map;

public interface MembershipService {
    MembershipResponse assignMembership(AssignMembershipRequest request);
    MembershipResponse renewMembership(Long membershipId, RenewMembershipRequest request);
    Map<String, String> handlePaymentCallback(PaymentCallbackRequest callback);
    List<MembershipResponse> getMemberMemberships(Long memberId);
    MembershipResponse getMembershipById(Long membershipId);
    MembershipResponse cancelMembership(Long membershipId);
    int expireMemberships();
}
