package com.library.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.library.entity.Book;

public interface BookService extends IService<Book> {
    IPage<Book> getBooksPage(int page, int size, String keyword, String category);
    
    Book addBook(Book book);
    
    Book updateBook(Book book);
    
    Boolean deleteBook(Long bookId);
    
    Book updateBookStatus(Long bookId, String status);
}