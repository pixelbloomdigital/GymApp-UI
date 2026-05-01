package com.pixelbloom.publicInfo.service;

import java.util.List;
import java.util.Map;

import com.pixelbloom.publicInfo.dto.CostumeBookingRequest;
import com.pixelbloom.publicInfo.dto.CostumeRequest;
import com.pixelbloom.publicInfo.dto.PaymentCallbackRequest;
import com.pixelbloom.publicInfo.entity.Costume;
import com.pixelbloom.publicInfo.entity.CostumeBooking;
import com.pixelbloom.publicInfo.enums.CostumeCategory;

public interface CostumeService {
    List<Costume> getAllActiveCostumes();
    List<Costume> getCostumesByCategory(CostumeCategory category);
    Costume getCostumeById(Long id);
    Costume createCostume(CostumeRequest request);
    Costume updateCostume(Long id, CostumeRequest request);
    void deleteCostume(Long id);

    // Booking
    CostumeBooking initiateBooking(CostumeBookingRequest request);
    Map<String, String> handlePaymentCallback(PaymentCallbackRequest callback);
    CostumeBooking confirmPickup(Long bookingId, String conditionImageUrl);
    CostumeBooking confirmReturn(Long bookingId);
    List<CostumeBooking> getBookingsByBooker(Long bookerId, String bookerType);
    List<CostumeBooking> getAllBookings();
}
