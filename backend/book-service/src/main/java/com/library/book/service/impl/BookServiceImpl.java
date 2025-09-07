package com.library.book.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.book.dto.BookRequest;
import com.library.book.dto.BookResponse;
import com.library.book.mapper.BookMapper;
import com.library.book.service.BookService;
import com.library.common.entity.Book;
import com.library.common.enums.BookStatus;
import com.library.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {
    
    private final BookMapper bookMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public BookResponse addBook(BookRequest request) {
        QueryWrapper<Book> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("isbn", request.getIsbn());
        queryWrapper.eq("is_deleted", false);
        
        Book existBook = bookMapper.selectOne(queryWrapper);
        if (existBook != null) {
            throw new BusinessException("ISBN已存在");
        }
        
        Book book = new Book();
        BeanUtils.copyProperties(request, book);
        book.setAvailableStock(request.getStock());
        
        int result = bookMapper.insert(book);
        if (result <= 0) {
            throw new BusinessException("添加图书失败");
        }
        
        BookResponse response = new BookResponse();
        BeanUtils.copyProperties(book, response);
        return response;
    }
    
    @Override
    public BookResponse updateBook(Long bookId, BookRequest request) {
        Book existBook = bookMapper.selectById(bookId);
        if (existBook == null) {
            throw new BusinessException("图书不存在");
        }
        
        Book book = new Book();
        BeanUtils.copyProperties(request, book);
        book.setId(bookId);
        
        if (request.getStock() != null) {
            int stockDiff = request.getStock() - existBook.getStock();
            book.setAvailableStock(existBook.getAvailableStock() + stockDiff);
        }
        
        int result = bookMapper.updateById(book);
        if (result <= 0) {
            throw new BusinessException("更新图书失败");
        }
        
        redisTemplate.delete("book:info:" + bookId);
        
        Book updatedBook = bookMapper.selectById(bookId);
        BookResponse response = new BookResponse();
        BeanUtils.copyProperties(updatedBook, response);
        return response;
    }
    
    @Override
    public void deleteBook(Long bookId) {
        Book book = bookMapper.selectById(bookId);
        if (book == null) {
            throw new BusinessException("图书不存在");
        }
        
        if (book.getAvailableStock() < book.getStock()) {
            throw new BusinessException("图书有借阅记录，无法删除");
        }
        
        int result = bookMapper.deleteById(bookId);
        if (result <= 0) {
            throw new BusinessException("删除图书失败");
        }
        
        redisTemplate.delete("book:info:" + bookId);
    }
    
    @Override
    public BookResponse getBookById(Long bookId) {
        Book book = (Book) redisTemplate.opsForValue().get("book:info:" + bookId);
        if (book == null) {
            book = bookMapper.selectById(bookId);
            if (book == null) {
                throw new BusinessException("图书不存在");
            }
            redisTemplate.opsForValue().set("book:info:" + bookId, book, 1, TimeUnit.HOURS);
        }
        
        BookResponse response = new BookResponse();
        BeanUtils.copyProperties(book, response);
        return response;
    }
    
    @Override
    public Page<BookResponse> getBookList(Integer current, Integer size, String keyword, String category, BookStatus status) {
        Page<Book> page = new Page<>(current, size);
        QueryWrapper<Book> queryWrapper = new QueryWrapper<>();
        
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> wrapper
                .like("title", keyword)
                .or()
                .like("author", keyword)
                .or()
                .like("isbn", keyword)
            );
        }
        
        if (StringUtils.hasText(category)) {
            queryWrapper.eq("category", category);
        }
        
        if (status != null) {
            queryWrapper.eq("status", status);
        }
        
        queryWrapper.eq("is_deleted", false);
        queryWrapper.orderByDesc("create_time");
        
        Page<Book> bookPage = bookMapper.selectPage(page, queryWrapper);
        
        Page<BookResponse> responsePage = new Page<>();
        BeanUtils.copyProperties(bookPage, responsePage, "records");
        
        responsePage.setRecords(bookPage.getRecords().stream()
            .map(book -> {
                BookResponse response = new BookResponse();
                BeanUtils.copyProperties(book, response);
                return response;
            })
            .toList());
        
        return responsePage;
    }
    
    @Override
    public void changeBookStatus(Long bookId, BookStatus status) {
        Book book = bookMapper.selectById(bookId);
        if (book == null) {
            throw new BusinessException("图书不存在");
        }
        
        book.setStatus(status);
        int result = bookMapper.updateById(book);
        if (result <= 0) {
            throw new BusinessException("状态更新失败");
        }
        
        redisTemplate.delete("book:info:" + bookId);
    }
    
    @Override
    public void updateStock(Long bookId, Integer stock) {
        Book book = bookMapper.selectById(bookId);
        if (book == null) {
            throw new BusinessException("图书不存在");
        }
        
        int stockDiff = stock - book.getStock();
        book.setStock(stock);
        book.setAvailableStock(book.getAvailableStock() + stockDiff);
        
        int result = bookMapper.updateById(book);
        if (result <= 0) {
            throw new BusinessException("库存更新失败");
        }
        
        redisTemplate.delete("book:info:" + bookId);
    }
    
    @Override
    public boolean decreaseStock(Long bookId, Integer count) {
        Book book = bookMapper.selectById(bookId);
        if (book == null) {
            return false;
        }
        
        if (book.getStatus() != BookStatus.AVAILABLE || book.getAvailableStock() < count) {
            return false;
        }
        
        int result = bookMapper.decreaseStock(bookId, count);
        if (result > 0) {
            redisTemplate.delete("book:info:" + bookId);
            return true;
        }
        
        return false;
    }
    
    @Override
    public void increaseStock(Long bookId, Integer count) {
        Book book = bookMapper.selectById(bookId);
        if (book == null) {
            throw new BusinessException("图书不存在");
        }
        
        int result = bookMapper.increaseStock(bookId, count);
        if (result > 0) {
            redisTemplate.delete("book:info:" + bookId);
        }
    }
    
    @Override
    public Page<BookResponse> getAvailableBooks(Integer current, Integer size, String keyword, String category) {
        Page<Book> page = new Page<>(current, size);
        QueryWrapper<Book> queryWrapper = new QueryWrapper<>();
        
        queryWrapper.eq("status", BookStatus.AVAILABLE);
        queryWrapper.gt("available_stock", 0);
        
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> wrapper
                .like("title", keyword)
                .or()
                .like("author", keyword)
                .or()
                .like("isbn", keyword)
            );
        }
        
        if (StringUtils.hasText(category)) {
            queryWrapper.eq("category", category);
        }
        
        queryWrapper.eq("is_deleted", false);
        queryWrapper.orderByDesc("create_time");
        
        Page<Book> bookPage = bookMapper.selectPage(page, queryWrapper);
        
        Page<BookResponse> responsePage = new Page<>();
        BeanUtils.copyProperties(bookPage, responsePage, "records");
        
        responsePage.setRecords(bookPage.getRecords().stream()
            .map(book -> {
                BookResponse response = new BookResponse();
                BeanUtils.copyProperties(book, response);
                return response;
            })
            .toList());
        
        return responsePage;
    }
}