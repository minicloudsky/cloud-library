package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.library.entity.Book;
import com.library.entity.BorrowRecord;
import com.library.entity.User;
import com.library.enums.BookStatus;
import com.library.enums.BorrowStatus;
import com.library.mapper.BorrowRecordMapper;
import com.library.service.BookService;
import com.library.service.BorrowService;
import com.library.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class BorrowServiceImpl extends ServiceImpl<BorrowRecordMapper, BorrowRecord> implements BorrowService {

    @Autowired
    private BookService bookService;

    @Autowired
    private UserService userService;

    @Override
    @Transactional
    public BorrowRecord borrowBook(Long bookId) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("用户未登录");
        }

        Book book = bookService.getById(bookId);
        if (book == null || book.getStatus() != BookStatus.AVAILABLE) {
            throw new RuntimeException("图书不存在或不可借阅");
        }

        if (book.getAvailableQuantity() <= 0) {
            throw new RuntimeException("图书库存不足");
        }

        LambdaQueryWrapper<BorrowRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(BorrowRecord::getUserId, currentUser.getId())
                   .eq(BorrowRecord::getBookId, bookId)
                   .eq(BorrowRecord::getStatus, BorrowStatus.BORROWED);
        
        if (this.getOne(queryWrapper) != null) {
            throw new RuntimeException("您已借阅了这本书，请先归还后再借阅");
        }

        BorrowRecord borrowRecord = new BorrowRecord();
        borrowRecord.setUserId(currentUser.getId());
        borrowRecord.setBookId(bookId);
        borrowRecord.setBorrowDate(LocalDateTime.now());
        borrowRecord.setDueDate(LocalDateTime.now().plusDays(30));
        borrowRecord.setStatus(BorrowStatus.BORROWED);
        borrowRecord.setFineAmount(BigDecimal.ZERO);

        book.setAvailableQuantity(book.getAvailableQuantity() - 1);
        bookService.updateById(book);

        this.save(borrowRecord);

        borrowRecord.setUser(currentUser);
        borrowRecord.setBook(book);
        
        return borrowRecord;
    }

    @Override
    @Transactional
    public BorrowRecord returnBook(Long recordId) {
        BorrowRecord borrowRecord = this.getById(recordId);
        if (borrowRecord == null) {
            throw new RuntimeException("借阅记录不存在");
        }

        if (borrowRecord.getStatus() != BorrowStatus.BORROWED) {
            throw new RuntimeException("图书已归还或状态异常");
        }

        Book book = bookService.getById(borrowRecord.getBookId());
        if (book == null) {
            throw new RuntimeException("图书信息不存在");
        }

        borrowRecord.setReturnDate(LocalDateTime.now());
        borrowRecord.setStatus(BorrowStatus.RETURNED);

        if (LocalDateTime.now().isAfter(borrowRecord.getDueDate())) {
            borrowRecord.setStatus(BorrowStatus.OVERDUE);
            long overdueDays = java.time.Duration.between(borrowRecord.getDueDate(), LocalDateTime.now()).toDays();
            borrowRecord.setFineAmount(BigDecimal.valueOf(overdueDays * 0.5));
        }

        book.setAvailableQuantity(book.getAvailableQuantity() + 1);
        bookService.updateById(book);

        this.updateById(borrowRecord);

        User user = userService.getById(borrowRecord.getUserId());
        borrowRecord.setUser(user);
        borrowRecord.setBook(book);

        return borrowRecord;
    }

    @Override
    public IPage<BorrowRecord> getBorrowRecordsPage(int page, int size, String keyword, String status) {
        Page<BorrowRecord> pageObj = new Page<>(page, size);
        LambdaQueryWrapper<BorrowRecord> queryWrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(status)) {
            queryWrapper.eq(BorrowRecord::getStatus, BorrowStatus.valueOf(status));
        }

        queryWrapper.orderByDesc(BorrowRecord::getBorrowDate);

        IPage<BorrowRecord> result = baseMapper.selectBorrowRecordsWithDetails(pageObj, queryWrapper);

        // 填充用户和图书信息
        for (BorrowRecord record : result.getRecords()) {
            // 构建用户信息（使用查询中的数据）
            if (record.getUsername() != null) {
                User user = new User();
                user.setId(record.getUserId());
                user.setUsername(record.getUsername());
                user.setRealName(record.getUserRealName());
                record.setUser(user);
            }
            
            // 构建书籍信息（使用查询中的数据）
            if (record.getBookTitle() != null) {
                Book book = new Book();
                book.setId(record.getBookId());
                book.setTitle(record.getBookTitle());
                book.setAuthor(record.getBookAuthor());
                record.setBook(book);
            }
        }

        return result;
    }

    @Override
    public IPage<BorrowRecord> getMyBorrowRecords(int page, int size) {
        User currentUser = userService.getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("用户未登录");
        }

        Page<BorrowRecord> pageObj = new Page<>(page, size);
        LambdaQueryWrapper<BorrowRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(BorrowRecord::getUserId, currentUser.getId())
                   .orderByDesc(BorrowRecord::getBorrowDate);

        IPage<BorrowRecord> result = baseMapper.selectBorrowRecordsWithDetails(pageObj, queryWrapper);

        // 填充用户和图书信息
        for (BorrowRecord record : result.getRecords()) {
            // 构建用户信息（使用查询中的数据）
            if (record.getUsername() != null) {
                User user = new User();
                user.setId(record.getUserId());
                user.setUsername(record.getUsername());
                user.setRealName(record.getUserRealName());
                record.setUser(user);
            }
            
            // 构建书籍信息（使用查询中的数据）
            if (record.getBookTitle() != null) {
                Book book = new Book();
                book.setId(record.getBookId());
                book.setTitle(record.getBookTitle());
                book.setAuthor(record.getBookAuthor());
                record.setBook(book);
            }
        }

        return result;
    }
}