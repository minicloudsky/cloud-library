package com.library.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.library.enums.BorrowStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("borrow_records")
public class BorrowRecord {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;
    
    @TableField("book_id")
    private Long bookId;
    
    @TableField("borrow_date")
    private LocalDateTime borrowDate;
    
    @TableField("due_date")
    private LocalDateTime dueDate;
    
    @TableField("return_date")
    private LocalDateTime returnDate;
    
    private BorrowStatus status;
    
    @TableField("fine_amount")
    private BigDecimal fineAmount;
    
    private String remark;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private User user;
    
    @TableField(exist = false)
    private Book book;
    
    @TableField(exist = false)
    private String username;
    
    @TableField(exist = false)
    private String userRealName;
    
    @TableField(exist = false)
    private String bookTitle;
    
    @TableField(exist = false)
    private String bookAuthor;
}