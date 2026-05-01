package com.pixelbloom.coreService.service;

import java.util.List;

import com.pixelbloom.coreService.requestDto.CreateCustomerRequest;
import com.pixelbloom.coreService.requestDto.UpdateCustomerRequest;
import com.pixelbloom.coreService.responseDto.CustomerResponse;

public interface MemberService {
    CustomerResponse createCustomer(CreateCustomerRequest request);
    CustomerResponse getCustomerById(Long id);
    CustomerResponse getCustomerByEmail(String email);
    List<CustomerResponse> getAllMembers();
    CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request);
    void deleteCustomer(Long id);
}