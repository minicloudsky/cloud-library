package com.library.book.dto;

import com.library.common.enums.BookStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    private LocalDate publishDate;
    private String category;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Integer availableStock;
    private BookStatus status;
    private String bookCover;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}