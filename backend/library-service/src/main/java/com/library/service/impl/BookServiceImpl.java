package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.library.entity.Book;
import com.library.enums.BookStatus;
import com.library.mapper.BookMapper;
import com.library.service.BookService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class BookServiceImpl extends ServiceImpl<BookMapper, Book> implements BookService {

    @Override
    public IPage<Book> getBooksPage(int page, int size, String keyword, String category) {
        Page<Book> pageObj = new Page<>(page, size);
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
        
        queryWrapper.ne(Book::getStatus, BookStatus.DELETED)
                   .orderByDesc(Book::getCreateTime);
        
        return this.page(pageObj, queryWrapper);
    }

    @Override
    public Book addBook(Book book) {
        if (StringUtils.hasText(book.getIsbn())) {
            LambdaQueryWrapper<Book> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Book::getIsbn, book.getIsbn())
                       .ne(Book::getStatus, BookStatus.DELETED);
            
            if (this.getOne(queryWrapper) != null) {
                throw new RuntimeException("ISBN已存在");
            }
        }
        
        if (book.getTotalQuantity() == null) {
            book.setTotalQuantity(1);
        }
        if (book.getAvailableQuantity() == null) {
            book.setAvailableQuantity(book.getTotalQuantity());
        }
        if (book.getStatus() == null) {
            book.setStatus(BookStatus.AVAILABLE);
        }
        
        this.save(book);
        return book;
    }

    @Override
    public Book updateBook(Book book) {
        Book existingBook = this.getById(book.getId());
        if (existingBook == null || existingBook.getStatus() == BookStatus.DELETED) {
            throw new RuntimeException("图书不存在");
        }
        
        if (StringUtils.hasText(book.getIsbn()) && !book.getIsbn().equals(existingBook.getIsbn())) {
            LambdaQueryWrapper<Book> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(Book::getIsbn, book.getIsbn())
                       .ne(Book::getId, book.getId())
                       .ne(Book::getStatus, BookStatus.DELETED);
            
            if (this.getOne(queryWrapper) != null) {
                throw new RuntimeException("ISBN已存在");
            }
        }
        
        if (book.getTotalQuantity() != null && book.getTotalQuantity() < existingBook.getAvailableQuantity()) {
            throw new RuntimeException("总数量不能小于当前可借数量");
        }
        
        this.updateById(book);
        return this.getById(book.getId());
    }

    @Override
    public Boolean deleteBook(Long bookId) {
        Book book = this.getById(bookId);
        if (book == null) {
            throw new RuntimeException("图书不存在");
        }
        
        if (!book.getAvailableQuantity().equals(book.getTotalQuantity())) {
            throw new RuntimeException("该图书还有未归还的记录，无法删除");
        }
        
        book.setStatus(BookStatus.DELETED);
        return this.updateById(book);
    }

    @Override
    public Book updateBookStatus(Long bookId, String status) {
        Book book = this.getById(bookId);
        if (book == null || book.getStatus() == BookStatus.DELETED) {
            throw new RuntimeException("图书不存在");
        }
        
        book.setStatus(BookStatus.valueOf(status));
        this.updateById(book);
        return book;
    }
}