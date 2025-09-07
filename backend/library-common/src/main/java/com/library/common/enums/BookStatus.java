package com.library.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BookStatus {
    AVAILABLE(1, "可借阅"),
    UNAVAILABLE(2, "不可借阅"),
    MAINTENANCE(3, "维护中"),
    LOST(4, "丢失");
    
    @EnumValue
    private final Integer code;
    private final String description;
    
    public static BookStatus getByCode(Integer code) {
        for (BookStatus status : BookStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid book status code: " + code);
    }
}