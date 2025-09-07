package com.library.dubbo;

import com.library.dto.LoginRequest;
import com.library.dto.LoginResponse;
import com.library.dto.RegisterRequest;
import com.library.dto.Result;
import com.library.entity.Book;
import com.library.entity.BorrowRecord;
import com.library.entity.User;

import java.util.List;

public interface LibraryDubboService {
    Result<LoginResponse> login(LoginRequest loginRequest);
    
    Result<User> register(RegisterRequest registerRequest);
    
    Result<List<Book>> getBooksList(String keyword, String category);
    
    Result<Book> getBookById(Long bookId);
    
    Result<BorrowRecord> borrowBook(Long bookId, String username);
    
    Result<BorrowRecord> returnBook(Long recordId);
    
    Result<List<BorrowRecord>> getUserBorrowRecords(String username);
}