package com.library.book.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.book.dto.BookRequest;
import com.library.book.dto.BookResponse;
import com.library.common.enums.BookStatus;

public interface BookService {
    
    BookResponse addBook(BookRequest request);
    
    BookResponse updateBook(Long bookId, BookRequest request);
    
    void deleteBook(Long bookId);
    
    BookResponse getBookById(Long bookId);
    
    Page<BookResponse> getBookList(Integer current, Integer size, String keyword, String category, BookStatus status);
    
    void changeBookStatus(Long bookId, BookStatus status);
    
    void updateStock(Long bookId, Integer stock);
    
    boolean decreaseStock(Long bookId, Integer count);
    
    void increaseStock(Long bookId, Integer count);
    
    Page<BookResponse> getAvailableBooks(Integer current, Integer size, String keyword, String category);
}