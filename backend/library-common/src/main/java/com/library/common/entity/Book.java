package com.library.common.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.library.common.enums.BookStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName("books")
public class Book {
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;
    
    @NotBlank(message = "图书标题不能为空")
    @TableField("title")
    private String title;
    
    @NotBlank(message = "作者不能为空")
    @TableField("author")
    private String author;
    
    @NotBlank(message = "ISBN不能为空")
    @TableField("isbn")
    private String isbn;
    
    @TableField("publisher")
    private String publisher;
    
    @TableField("publish_date")
    private LocalDate publishDate;
    
    @TableField("category")
    private String category;
    
    @TableField("description")
    private String description;
    
    @Positive(message = "价格必须大于0")
    @TableField("price")
    private BigDecimal price;
    
    @NotNull(message = "库存数量不能为空")
    @TableField("stock")
    private Integer stock;
    
    @TableField("available_stock")
    private Integer availableStock;
    
    @NotNull(message = "图书状态不能为空")
    @TableField("status")
    private BookStatus status;
    
    @TableField("book_cover")
    private String bookCover;
    
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    @TableField("is_deleted")
    private Boolean isDeleted;
}