package com.pixelbloom.authLogin.requestdto;

import lombok.Data;

@Data
public class AdminRegisterRequest {
    public String name;
    public String email;
    public String phone;
    public String gymCenter;
    public String password;
}
