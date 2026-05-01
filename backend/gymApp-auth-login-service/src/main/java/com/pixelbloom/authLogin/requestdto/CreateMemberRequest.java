package com.pixelbloom.authLogin.requestdto;

import lombok.*;

@Getter @Setter
public class CreateMemberRequest {
    public Long visitorId;
    public String password;
    public String gymCenter;
}