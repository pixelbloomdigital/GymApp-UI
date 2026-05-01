package com.pixelbloom.authLogin.requestdto;

import com.pixelbloom.authLogin.entity.BatchType;
import lombok.Data;

import java.util.List;

@Data
public class CompleteProfileRequest {
    private String phone;
    private String gymCenter;
    private List<BatchType> preferredBatches;
}
