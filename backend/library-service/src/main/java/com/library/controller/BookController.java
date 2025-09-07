package com.library.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.library.dto.PageResult;
import com.library.dto.Result;
import com.library.entity.Book;
import com.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping("/page")
    public Result<PageResult<Book>> getBooksPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category) {
        try {
            IPage<Book> result = bookService.getBooksPage(page, size, keyword, category);
            PageResult<Book> pageResult = PageResult.of(
                result.getRecords(), 
                result.getTotal(), 
                result.getSize(), 
                result.getCurrent()
            );
            return Result.success(pageResult);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Result<Book> getBook(@PathVariable Long id) {
        try {
            Book book = bookService.getById(id);
            if (book == null) {
                return Result.error("图书不存在");
            }
            return Result.success(book);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public Result<Book> addBook(@RequestBody Book book) {
        try {
            Book savedBook = bookService.addBook(book);
            return Result.success(savedBook);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public Result<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        try {
            book.setId(id);
            Book updatedBook = bookService.updateBook(book);
            return Result.success(updatedBook);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Boolean> deleteBook(@PathVariable Long id) {
        try {
            Boolean result = bookService.deleteBook(id);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public Result<Book> updateBookStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Book book = bookService.updateBookStatus(id, status);
            return Result.success(book);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}