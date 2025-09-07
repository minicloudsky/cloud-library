package com.library.user.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.common.dto.Result;
import com.library.common.entity.User;
import com.library.user.dto.LoginRequest;
import com.library.user.dto.RegisterRequest;
import com.library.user.dto.UserInfoResponse;
import com.library.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    @PostMapping("/login")
    public Result<String> login(@Valid @RequestBody LoginRequest request) {
        String token = userService.login(request);
        return Result.success("登录成功", token);
    }
    
    @PostMapping("/register")
    public Result<UserInfoResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserInfoResponse response = userService.register(request);
        return Result.success("注册成功", response);
    }
    
    @GetMapping("/info/{userId}")
    public Result<UserInfoResponse> getUserInfo(@PathVariable Long userId) {
        UserInfoResponse response = userService.getUserInfo(userId);
        return Result.success(response);
    }
    
    @PutMapping("/{userId}")
    public Result<UserInfoResponse> updateUser(@PathVariable Long userId, @RequestBody User user) {
        UserInfoResponse response = userService.updateUser(userId, user);
        return Result.success("更新成功", response);
    }
    
    @DeleteMapping("/{userId}")
    public Result<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return Result.success("删除成功");
    }
    
    @GetMapping("/list")
    public Result<Page<UserInfoResponse>> getUserList(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        Page<UserInfoResponse> page = userService.getUserList(current, size, keyword);
        return Result.success(page);
    }
    
    @PutMapping("/{userId}/status")
    public Result<Void> changeUserStatus(@PathVariable Long userId, @RequestParam Boolean status) {
        userService.changeUserStatus(userId, status);
        return Result.success("状态更新成功");
    }
    
    @GetMapping("/{userId}/permission/{permission}")
    public Result<Boolean> hasPermission(@PathVariable Long userId, @PathVariable String permission) {
        boolean hasPermission = userService.hasPermission(userId, permission);
        return Result.success(hasPermission);
    }
}