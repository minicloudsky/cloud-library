package com.library.enums;

public enum UserRole {
    STUDENT("学生"),
    TEACHER("老师"),
    ADMIN("管理员");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}