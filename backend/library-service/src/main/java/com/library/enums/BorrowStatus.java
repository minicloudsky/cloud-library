package com.library.enums;

public enum BorrowStatus {
    BORROWED("已借阅"),
    RETURNED("已归还"),
    OVERDUE("已逾期"),
    LOST("已丢失");

    private final String description;

    BorrowStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}