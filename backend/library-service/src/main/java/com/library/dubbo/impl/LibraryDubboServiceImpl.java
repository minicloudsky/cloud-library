package com.library.dubbo.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.library.dto.LoginRequest;
import com.library.dto.LoginResponse;
import com.library.dto.RegisterRequest;
import com.library.dto.Result;
import com.library.dubbo.LibraryDubboService;
import com.library.entity.Book;
import com.library.entity.BorrowRecord;
import com.library.entity.User;
import com.library.enums.BookStatus;
import com.library.service.BookService;
import com.library.service.BorrowService;
import com.library.service.UserService;
import org.apache.dubbo.config.annotation.DubboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import java.util.List;

@DubboService
public class LibraryDubboServiceImpl implements LibraryDubboService {

    @Autowired
    private UserService userService;

    @Autowired
    private BookService bookService;

    @Autowired
    private BorrowService borrowService;

    @Override
    public Result<LoginResponse> login(LoginRequest loginRequest) {
        try {
            LoginResponse response = userService.login(loginRequest);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Override
    public Result<User> register(RegisterRequest registerRequest) {
        try {
            User user = userService.register(registerRequest);
            return Result.success(user);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Override
    public Result<List<Book>> getBooksList(String keyword, String category) {
        try {
            LambdaQueryWrapper<Book> queryWrapper = new LambdaQueryWrapper<>();
            
            if (StringUtils.hasText(keyword)) {
                queryWrapper.and(wrapper -> wrapper
                    .like(Book::getTitle, keyword)
                    .or().like(Book::getAuthor, keyword)
                    .or().like(Book::getIsbn, keyword)
                    .or().like(Book::getPublisher, keyword)
                );
            }
            
            if (StringUtils.hasText(category)) {
                queryWrapper.eq(Book::getCategory, category);
            }
            
            queryWrapper.eq(Book::getStatus, BookStatus.AVAILABLE)
                       .orderByDesc(Book::getCreateTime)
                       .last("LIMIT 100");
            
            List<Book> books = bookService.list(queryWrapper);
            return Result.success(books);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Override
    public Result<Book> getBookById(Long bookId) {
        try {
            Book book = bookService.getById(bookId);
            if (book == null || book.getStatus() == BookStatus.DELETED) {
                return Result.error("图书不存在");
            }
            return Result.success(book);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Override
    public Result<BorrowRecord> borrowBook(Long bookId, String username) {
        try {
            BorrowRecord borrowRecord = borrowService.borrowBook(bookId);
            return Result.success(borrowRecord);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Override
    public Result<BorrowRecord> returnBook(Long recordId) {
        try {
            BorrowRecord borrowRecord = borrowService.returnBook(recordId);
            return Result.success(borrowRecord);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @Override
    public Result<List<BorrowRecord>> getUserBorrowRecords(String username) {
        try {
            LambdaQueryWrapper<User> userQueryWrapper = new LambdaQueryWrapper<>();
            userQueryWrapper.eq(User::getUsername, username);
            User user = userService.getOne(userQueryWrapper);
            
            if (user == null) {
                return Result.error("用户不存在");
            }

            IPage<BorrowRecord> result = borrowService.getMyBorrowRecords(1, 100);
            return Result.success(result.getRecords());
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}