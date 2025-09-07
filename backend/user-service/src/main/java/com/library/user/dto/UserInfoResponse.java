package com.library.user.dto;

import com.library.common.enums.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserInfoResponse {
    private Long id;
    private String username;
    private String realName;
    private String email;
    private String phone;
    private UserRole role;
    private Boolean isActive;
    private LocalDateTime createTime;
}