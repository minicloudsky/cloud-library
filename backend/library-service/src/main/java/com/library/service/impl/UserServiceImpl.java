package com.library.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.library.dto.LoginRequest;
import com.library.dto.LoginResponse;
import com.library.dto.RegisterRequest;
import com.library.entity.User;
import com.library.mapper.UserMapper;
import com.library.service.UserService;
import com.library.utils.JwtUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, loginRequest.getUsername())
                   .eq(User::getStatus, 1);
        
        User user = this.getOne(queryWrapper);
        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().name());
        response.setRealName(user.getRealName());

        return response;
    }

    @Override
    public User register(RegisterRequest registerRequest) {
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, registerRequest.getUsername());
        
        if (this.getOne(queryWrapper) != null) {
            throw new RuntimeException("用户名已存在");
        }

        if (StringUtils.hasText(registerRequest.getEmail())) {
            queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(User::getEmail, registerRequest.getEmail());
            if (this.getOne(queryWrapper) != null) {
                throw new RuntimeException("邮箱已存在");
            }
        }

        User user = new User();
        BeanUtils.copyProperties(registerRequest, user);
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setStatus(1);

        this.save(user);
        user.setPassword(null);
        return user;
    }

    @Override
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return null;
        }
        
        String username = authentication.getName();
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getUsername, username);
        User user = this.getOne(queryWrapper);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }

    @Override
    public IPage<User> getUsersPage(int page, int size, String keyword) {
        Page<User> pageObj = new Page<>(page, size);
        LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> wrapper
                .like(User::getUsername, keyword)
                .or().like(User::getRealName, keyword)
                .or().like(User::getEmail, keyword)
                .or().like(User::getStudentId, keyword)
            );
        }
        
        queryWrapper.orderByDesc(User::getCreateTime);
        IPage<User> result = this.page(pageObj, queryWrapper);
        
        result.getRecords().forEach(user -> user.setPassword(null));
        return result;
    }

    @Override
    public User updateUserStatus(Long userId, Integer status) {
        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        user.setStatus(status);
        this.updateById(user);
        user.setPassword(null);
        return user;
    }
}