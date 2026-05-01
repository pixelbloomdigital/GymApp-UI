package com.pixelbloom.payment.serviceImpl;

import com.pixelbloom.payment.entity.Equipment;
import com.pixelbloom.payment.entity.Expense;
import com.pixelbloom.payment.repository.EquipmentRepository;
import com.pixelbloom.payment.repository.ExpenseRepository;
import com.pixelbloom.payment.requestDto.EquipmentRequest;
import com.pixelbloom.payment.responseDto.EquipmentResponse;
import com.pixelbloom.payment.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepo;
    private final ExpenseRepository expenseRepo;

    @Override
    public List<EquipmentResponse> getAllEquipment() {
        return equipmentRepo.findAllByOrderByPurchasedDateDescIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EquipmentResponse getEquipmentById(Long equipmentId) {
        Equipment equipment = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found: " + equipmentId));
        return toResponse(equipment);
    }

    @Override
    public EquipmentResponse createEquipment(EquipmentRequest request) {
        Equipment equipment = Equipment.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .quantity(request.getQuantity())
                .amount(request.getAmount())
                .vendor(request.getVendor().trim())
                .address(request.getAddress())
                .contact(request.getContact())
                .purchasedDate(request.getPurchasedDate())
                .build();

        equipment = equipmentRepo.save(equipment);

        Expense expense = expenseRepo.save(Expense.builder()
                .topic("EQUIPMENT")
                .description(buildExpenseDescription(request))
                .amount(request.getAmount().multiply(java.math.BigDecimal.valueOf(request.getQuantity())))
                .paidTo(request.getVendor())
                .expenseDate(request.getPurchasedDate())
                .recordedBy(normalizeRecordedBy(request.getRecordedBy()))
                .equipmentId(equipment.getId())
                .build());

        equipment.setExpenseId(expense.getId());
        equipment = equipmentRepo.save(equipment);
        return toResponse(equipment);
    }

    @Override
    public EquipmentResponse updateEquipment(Long equipmentId, EquipmentRequest request) {
        Equipment equipment = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found: " + equipmentId));

        equipment.setName(request.getName().trim());
        equipment.setDescription(request.getDescription());
        equipment.setQuantity(request.getQuantity());
        equipment.setAmount(request.getAmount());
        equipment.setVendor(request.getVendor().trim());
        equipment.setAddress(request.getAddress());
        equipment.setContact(request.getContact());
        equipment.setPurchasedDate(request.getPurchasedDate());

        // Update original expense with recalculated amount (amount * quantity)
        if (equipment.getExpenseId() != null) {
            Expense originalExpense = expenseRepo.findById(equipment.getExpenseId())
                    .orElse(null);
            if (originalExpense != null) {
                originalExpense.setAmount(request.getAmount().multiply(java.math.BigDecimal.valueOf(request.getQuantity())));
                originalExpense.setDescription(buildExpenseDescription(request));
                expenseRepo.save(originalExpense);
            }
        }

        return toResponse(equipmentRepo.save(equipment));
    }

    @Override
    public void deleteEquipment(Long equipmentId) {
        Equipment equipment = equipmentRepo.findById(equipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found: " + equipmentId));
        equipmentRepo.delete(equipment);
    }

    private EquipmentResponse toResponse(Equipment equipment) {
        return EquipmentResponse.builder()
                .id(equipment.getId())
                .name(equipment.getName())
                .description(equipment.getDescription())
                .quantity(equipment.getQuantity())
                .amount(equipment.getAmount())
                .vendor(equipment.getVendor())
                .address(equipment.getAddress())
                .contact(equipment.getContact())
                .purchasedDate(equipment.getPurchasedDate())
                .expenseId(equipment.getExpenseId())
                .createdAt(equipment.getCreatedAt())
                .updatedAt(equipment.getUpdatedAt())
                .build();
    }

    private String buildExpenseDescription(EquipmentRequest request) {
        String description = request.getDescription() != null && !request.getDescription().isBlank()
                ? request.getDescription().trim()
                : request.getName().trim();
        return "Equipment purchase: " + description + " x" + request.getQuantity();
    }

    private String normalizeRecordedBy(String recordedBy) {
        return recordedBy == null || recordedBy.isBlank() ? "ADMIN" : recordedBy.trim();
    }
}