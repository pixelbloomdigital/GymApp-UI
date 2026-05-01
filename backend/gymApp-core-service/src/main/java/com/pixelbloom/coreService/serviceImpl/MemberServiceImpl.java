package com.pixelbloom.coreService.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pixelbloom.coreService.enums.MemberStatus;
import com.pixelbloom.coreService.exception.MemberNotFoundException;
import com.pixelbloom.coreService.model.memberModel.Member;
import com.pixelbloom.coreService.repository.CustomerRepository;
import com.pixelbloom.coreService.requestDto.CreateCustomerRequest;
import com.pixelbloom.coreService.requestDto.UpdateCustomerRequest;
import com.pixelbloom.coreService.responseDto.CustomerResponse;
import com.pixelbloom.coreService.service.MemberService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        Member customer = Member.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .status(MemberStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return toResponse(customerRepository.save(customer));
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {
        return toResponse(customerRepository.findById(id)
                .orElseThrow(() -> new MemberNotFoundException("Member not found: " + id)));
    }

    @Override
    public CustomerResponse getCustomerByEmail(String email) {
        return toResponse(customerRepository.findByEmail(email)
                .orElseThrow(() -> new MemberNotFoundException("Member not found for email: " + email)));
    }

    @Override
    public List<CustomerResponse> getAllMembers() {
        return customerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        Member customer = customerRepository.findById(id)
                .orElseThrow(() -> new MemberNotFoundException("Member not found: " + id));
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setPincode(request.getPincode());
        customer.setUpdatedAt(LocalDateTime.now());
        return toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id))
            throw new MemberNotFoundException("Member not found: " + id);
        customerRepository.deleteById(id);
    }

    private CustomerResponse toResponse(Member m) {
        return CustomerResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .email(m.getEmail())
                .phone(m.getPhone())
                .address(m.getAddress())
                .city(m.getCity())
                .state(m.getState())
                .pincode(m.getPincode())
                .status(m.getStatus())
                .build();
    }
}
