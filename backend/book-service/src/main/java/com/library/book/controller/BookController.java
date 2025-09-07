package com.library.book.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.book.dto.BookRequest;
import com.library.book.dto.BookResponse;
import com.library.book.service.BookService;
import com.library.common.dto.Result;
import com.library.common.enums.BookStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/book")
@RequiredArgsConstructor
@Slf4j
public class BookController {
    
    private final BookService bookService;
    
    @PostMapping
    public Result<BookResponse> addBook(@Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.addBook(request);
        return Result.success("添加图书成功", response);
    }
    
    @PutMapping("/{bookId}")
    public Result<BookResponse> updateBook(@PathVariable Long bookId, @Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.updateBook(bookId, request);
        return Result.success("更新图书成功", response);
    }
    
    @DeleteMapping("/{bookId}")
    public Result<Void> deleteBook(@PathVariable Long bookId) {
        bookService.deleteBook(bookId);
        return Result.success("删除图书成功");
    }
    
    @GetMapping("/{bookId}")
    public Result<BookResponse> getBookById(@PathVariable Long bookId) {
        BookResponse response = bookService.getBookById(bookId);
        return Result.success(response);
    }
    
    @GetMapping("/list")
    public Result<Page<BookResponse>> getBookList(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BookStatus status) {
        Page<BookResponse> page = bookService.getBookList(current, size, keyword, category, status);
        return Result.success(page);
    }
    
    @GetMapping("/available")
    public Result<Page<BookResponse>> getAvailableBooks(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        Page<BookResponse> page = bookService.getAvailableBooks(current, size, keyword, category);
        return Result.success(page);
    }
    
    @PutMapping("/{bookId}/status")
    public Result<Void> changeBookStatus(@PathVariable Long bookId, @RequestParam BookStatus status) {
        bookService.changeBookStatus(bookId, status);
        return Result.success("状态更新成功");
    }
    
    @PutMapping("/{bookId}/stock")
    public Result<Void> updateStock(@PathVariable Long bookId, @RequestParam Integer stock) {
        bookService.updateStock(bookId, stock);
        return Result.success("库存更新成功");
    }
    
    @PostMapping("/{bookId}/decrease-stock")
    public Result<Boolean> decreaseStock(@PathVariable Long bookId, @RequestParam Integer count) {
        boolean success = bookService.decreaseStock(bookId, count);
        return Result.success(success);
    }
    
    @PostMapping("/{bookId}/increase-stock")
    public Result<Void> increaseStock(@PathVariable Long bookId, @RequestParam Integer count) {
        bookService.increaseStock(bookId, count);
        return Result.success("库存增加成功");
    }
}