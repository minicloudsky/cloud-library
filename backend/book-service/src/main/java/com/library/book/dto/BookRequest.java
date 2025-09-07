package com.library.book.dto;

import com.library.common.enums.BookStatus;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookRequest {
    @NotBlank(message = "图书标题不能为空")
    private String title;
    
    @NotBlank(message = "作者不能为空")
    private String author;
    
    @NotBlank(message = "ISBN不能为空")
    private String isbn;
    
    private String publisher;
    
    private LocalDate publishDate;
    
    private String category;
    
    private String description;
    
    @Positive(message = "价格必须大于0")
    private BigDecimal price;
    
    @NotNull(message = "库存数量不能为空")
    private Integer stock;
    
    @NotNull(message = "图书状态不能为空")
    private BookStatus status;
    
    private String bookCover;
}