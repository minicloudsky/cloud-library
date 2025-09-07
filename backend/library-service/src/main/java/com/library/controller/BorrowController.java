package com.library.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.library.dto.PageResult;
import com.library.dto.Result;
import com.library.entity.BorrowRecord;
import com.library.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @PostMapping("/{bookId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public Result<BorrowRecord> borrowBook(@PathVariable Long bookId) {
        try {
            BorrowRecord borrowRecord = borrowService.borrowBook(bookId);
            return Result.success(borrowRecord);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/return/{recordId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public Result<BorrowRecord> returnBook(@PathVariable Long recordId) {
        try {
            BorrowRecord borrowRecord = borrowService.returnBook(recordId);
            return Result.success(borrowRecord);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/records")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public Result<PageResult<BorrowRecord>> getBorrowRecords(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        try {
            IPage<BorrowRecord> result = borrowService.getBorrowRecordsPage(page, size, keyword, status);
            PageResult<BorrowRecord> pageResult = PageResult.of(
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

    @GetMapping("/my-records")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public Result<PageResult<BorrowRecord>> getMyBorrowRecords(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            IPage<BorrowRecord> result = borrowService.getMyBorrowRecords(page, size);
            PageResult<BorrowRecord> pageResult = PageResult.of(
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
}