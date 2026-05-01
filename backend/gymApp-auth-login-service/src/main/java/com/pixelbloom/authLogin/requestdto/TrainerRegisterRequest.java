package com.pixelbloom.authLogin.requestdto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TrainerRegisterRequest {
    @NotBlank
    public String name;
    @Email @NotBlank
    public String email;
    @NotBlank
    public String phone;
    public String password;   // optional — if blank, SMS instructs to use Forgot Password
    public String gymCenter;
    public BigDecimal salaryPerHour;  // stored in batch_pay_rates
    public Long batchId;              // batch to assign trainer to
}
