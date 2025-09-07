package com.library.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.library.entity.BorrowRecord;

public interface BorrowService extends IService<BorrowRecord> {
    BorrowRecord borrowBook(Long bookId);
    
    BorrowRecord returnBook(Long recordId);
    
    IPage<BorrowRecord> getBorrowRecordsPage(int page, int size, String keyword, String status);
    
    IPage<BorrowRecord> getMyBorrowRecords(int page, int size);
}