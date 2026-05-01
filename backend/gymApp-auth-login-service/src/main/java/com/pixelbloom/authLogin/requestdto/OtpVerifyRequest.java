package com.pixelbloom.authLogin.requestdto;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    public String phone;
    public String otp;
}
