package com.library.user.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.common.entity.User;
import com.library.user.dto.LoginRequest;
import com.library.user.dto.RegisterRequest;
import com.library.user.dto.UserInfoResponse;

public interface UserService {
    
    String login(LoginRequest request);
    
    UserInfoResponse register(RegisterRequest request);
    
    UserInfoResponse getUserInfo(Long userId);
    
    UserInfoResponse updateUser(Long userId, User user);
    
    void deleteUser(Long userId);
    
    Page<UserInfoResponse> getUserList(Integer current, Integer size, String keyword);
    
    void changeUserStatus(Long userId, Boolean status);
    
    boolean hasPermission(Long userId, String permission);
}