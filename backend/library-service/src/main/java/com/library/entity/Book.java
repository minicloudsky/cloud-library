package com.library.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.library.enums.BookStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("books")
public class Book {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String isbn;
    
    private String title;
    
    private String author;
    
    private String publisher;
    
    @TableField("publish_date")
    private LocalDate publishDate;
    
    private String category;
    
    private BigDecimal price;
    
    @TableField("total_quantity")
    private Integer totalQuantity;
    
    @TableField("available_quantity")
    private Integer availableQuantity;
    
    private String description;
    
    @TableField("cover_url")
    private String coverUrl;
    
    private String location;
    
    private BookStatus status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}