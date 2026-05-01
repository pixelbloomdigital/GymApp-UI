package com.pixelbloom.authLogin.responsedto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class VisitorResponse {
    private Long visitorId;
    private String email;
    private String name;
    private String role;
    private String token;

}
