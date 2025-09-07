package com.library.common.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.library.common.enums.UserRole;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("users")
public class User {
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;
    
    @NotBlank(message = "用户名不能为空")
    @TableField("username")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @TableField("password")
    private String password;
    
    @NotBlank(message = "真实姓名不能为空")
    @TableField("real_name")
    private String realName;
    
    @Email(message = "邮箱格式不正确")
    @TableField("email")
    private String email;
    
    @TableField("phone")
    private String phone;
    
    @NotNull(message = "用户角色不能为空")
    @TableField("role")
    private UserRole role;
    
    @TableField("is_active")
    private Boolean isActive;
    
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    @TableField("is_deleted")
    private Boolean isDeleted;
}