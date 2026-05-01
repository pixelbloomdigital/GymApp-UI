package com.pixelbloom.coreService.serviceImpl;

import com.pixelbloom.coreService.enums.MembershipStatus;
import com.pixelbloom.coreService.repository.CustomerRepository;
import com.pixelbloom.coreService.repository.MemberMembershipRepository;
import com.pixelbloom.coreService.responseDto.DashboardSummaryResponse;
import com.pixelbloom.coreService.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final CustomerRepository customerRepository;
    private final MemberMembershipRepository membershipRepository;

    @Override
    public DashboardSummaryResponse getSummary() {
        long totalMembers   = customerRepository.count();
        long activeMembers  = membershipRepository.countByStatus(MembershipStatus.ACTIVE);
        long expired        = membershipRepository.countByStatus(MembershipStatus.EXPIRED);

        // Today's collection = sum of paidAmount for memberships activated today
        BigDecimal todayCollection = membershipRepository
                .findByStatusAndEndDateBefore(MembershipStatus.ACTIVE, LocalDate.now().plusDays(1))
                .stream()
                .filter(m -> m.getCreatedAt() != null
                        && m.getCreatedAt().toLocalDate().equals(LocalDate.now())
                        && m.getPaidAmount() != null)
                .map(m -> m.getPaidAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardSummaryResponse(totalMembers, activeMembers, todayCollection, activeMembers, expired);
    }
}
