package com.library.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.library.dto.LoginRequest;
import com.library.dto.LoginResponse;
import com.library.dto.RegisterRequest;
import com.library.entity.User;

public interface UserService extends IService<User> {
    LoginResponse login(LoginRequest loginRequest);
    
    User register(RegisterRequest registerRequest);
    
    User getCurrentUser();
    
    IPage<User> getUsersPage(int page, int size, String keyword);
    
    User updateUserStatus(Long userId, Integer status);
}