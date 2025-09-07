package com.library.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum UserRole {
    STUDENT(1, "学生"),
    TEACHER(2, "老师"),
    ADMIN(3, "管理员");
    
    @EnumValue
    private final Integer code;
    private final String description;
    
    public static UserRole getByCode(Integer code) {
        for (UserRole role : UserRole.values()) {
            if (role.getCode().equals(code)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid user role code: " + code);
    }
}