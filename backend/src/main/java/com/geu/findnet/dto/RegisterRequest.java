package com.geu.findnet.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String course;
    private String studentId;
    private String collegeEmail;
    private String personalEmail;
    private String password;
}
