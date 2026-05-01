package com.pixelbloom.payment.service;

import com.pixelbloom.payment.requestDto.EquipmentRequest;
import com.pixelbloom.payment.responseDto.EquipmentResponse;

import java.util.List;

public interface EquipmentService {
    List<EquipmentResponse> getAllEquipment();
    EquipmentResponse getEquipmentById(Long equipmentId);
    EquipmentResponse createEquipment(EquipmentRequest request);
    EquipmentResponse updateEquipment(Long equipmentId, EquipmentRequest request);
    void deleteEquipment(Long equipmentId);
}