package com.pixelbloom.coreService.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelbloom.coreService.enums.MemberStatus;
import com.pixelbloom.coreService.event.MemberCreatedEvent;
import com.pixelbloom.coreService.model.memberModel.Member;
import com.pixelbloom.coreService.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Listens for member creation events from auth-service and upserts
 * the member into gym_customersdb so core-service can look them up by ID.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class MemberCreatedEventListener {

    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "gym.member.created", groupId = "core-service-member-sync")
    public void onMemberCreated(String payload) {
        try {
            MemberCreatedEvent event = objectMapper.readValue(payload, MemberCreatedEvent.class);

            // Upsert: if member already exists (e.g. duplicate event), skip
            if (customerRepository.existsById(event.getMemberId())) {
                log.debug("Member {} already exists in gym_customersdb — skipping sync", event.getMemberId());
                return;
            }

            Member member = Member.builder()
                    .id(event.getMemberId())
                    .name(event.getName())
                    .email(event.getEmail())
                    .phone(event.getPhone())
                    .status(MemberStatus.INACTIVE)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            customerRepository.save(member);
            log.info("Synced member {} ({}) into gym_customersdb", event.getMemberId(), event.getEmail());

        } catch (Exception e) {
            log.error("Failed to sync MemberCreatedEvent: payload={}, error={}", payload, e.getMessage());
        }
    }
}
