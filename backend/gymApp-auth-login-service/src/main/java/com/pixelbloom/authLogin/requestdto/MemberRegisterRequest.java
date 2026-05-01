package com.pixelbloom.authLogin.requestdto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class MemberRegisterRequest {
    public String name;

    @Email
    public String email;

    public String phone;

    public String password;

    public String gymCenter;
}