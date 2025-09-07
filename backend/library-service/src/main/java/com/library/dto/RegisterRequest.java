package com.library.dto;

import com.library.enums.UserRole;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
public class RegisterRequest {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String phone;

    @NotBlank(message = "真实姓名不能为空")
    private String realName;

    private String studentId;

    private UserRole role = UserRole.STUDENT;
}