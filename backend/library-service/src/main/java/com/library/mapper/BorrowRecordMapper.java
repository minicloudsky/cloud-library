package com.library.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.entity.BorrowRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BorrowRecordMapper extends BaseMapper<BorrowRecord> {

    @Select("SELECT br.*, u.username, u.real_name as userRealName, b.title as bookTitle, b.author as bookAuthor " +
            "FROM borrow_records br " +
            "LEFT JOIN users u ON br.user_id = u.id " +
            "LEFT JOIN books b ON br.book_id = b.id " +
            "${ew.customSqlSegment}")
    IPage<BorrowRecord> selectBorrowRecordsWithDetails(Page<BorrowRecord> page, @Param("ew") Object wrapper);
}