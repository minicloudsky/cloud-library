package com.library.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.library.enums.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;
    
    private String password;
    
    private String email;
    
    private String phone;
    
    @TableField("real_name")
    private String realName;
    
    @TableField("student_id")
    private String studentId;
    
    private UserRole role;
    
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}