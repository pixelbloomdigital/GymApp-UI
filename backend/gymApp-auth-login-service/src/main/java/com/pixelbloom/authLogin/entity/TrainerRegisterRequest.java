package com.pixelbloom.authLogin.entity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrainerRegisterRequest {
    @NotBlank
    public String name;
    @Email @NotBlank
    public String email;
    @NotBlank
    public String phone;
    @NotBlank
    public String password;
    public String gymCenter;
}
