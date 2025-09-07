package com.library.common.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.library.common.enums.BorrowStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("borrow_records")
public class BorrowRecord {
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;
    
    @NotNull(message = "用户ID不能为空")
    @TableField("user_id")
    private Long userId;
    
    @NotNull(message = "图书ID不能为空")
    @TableField("book_id")
    private Long bookId;
    
    @TableField("borrow_date")
    private LocalDateTime borrowDate;
    
    @TableField("due_date")
    private LocalDateTime dueDate;
    
    @TableField("return_date")
    private LocalDateTime returnDate;
    
    @NotNull(message = "借阅状态不能为空")
    @TableField("status")
    private BorrowStatus status;
    
    @TableField("fine_amount")
    private BigDecimal fineAmount;
    
    @TableField("remarks")
    private String remarks;
    
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    @TableField("is_deleted")
    private Boolean isDeleted;
}