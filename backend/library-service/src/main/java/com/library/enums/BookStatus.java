package com.library.enums;

public enum BookStatus {
    AVAILABLE("可借阅"),
    UNAVAILABLE("不可借阅"),
    DELETED("已删除");

    private final String description;

    BookStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}