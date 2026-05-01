package com.pixelbloom.multimediaService.feignClient;

import com.pixelbloom.multimediaService.responseDto.MembershipResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@FeignClient(name = "gymApp-core-service", path = "/api/memberships")
public interface BatchAccessVerifier {

    @GetMapping("/member/{memberId}")
    List<MembershipResponse> getMemberMemberships(
            @PathVariable Long memberId,
            @RequestHeader("Authorization") String bearerToken);
}
