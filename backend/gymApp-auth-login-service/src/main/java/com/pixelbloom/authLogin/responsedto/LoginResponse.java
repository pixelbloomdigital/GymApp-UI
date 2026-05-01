package com.pixelbloom.authLogin.responsedto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
public class LoginResponse {
    private Long memberId;
    private String email;
    private String name;
    private String role;
    private String token;

}
