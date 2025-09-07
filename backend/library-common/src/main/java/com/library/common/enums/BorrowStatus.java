package com.library.common.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BorrowStatus {
    BORROWED(1, "已借出"),
    RETURNED(2, "已归还"),
    OVERDUE(3, "逾期"),
    LOST(4, "丢失"),
    DAMAGED(5, "损坏");
    
    @EnumValue
    private final Integer code;
    private final String description;
    
    public static BorrowStatus getByCode(Integer code) {
        for (BorrowStatus status : BorrowStatus.values()) {
            if (status.getCode().equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid borrow status code: " + code);
    }
}