package com.library.book.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.library.common.entity.Book;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BookMapper extends BaseMapper<Book> {
    
    @Update("UPDATE books SET available_stock = available_stock - #{count} WHERE id = #{bookId} AND available_stock >= #{count}")
    int decreaseStock(Long bookId, Integer count);
    
    @Update("UPDATE books SET available_stock = available_stock + #{count} WHERE id = #{bookId}")
    int increaseStock(Long bookId, Integer count);
}