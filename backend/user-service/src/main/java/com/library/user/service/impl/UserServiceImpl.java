package com.library.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.library.common.entity.User;
import com.library.common.enums.UserRole;
import com.library.common.exception.BusinessException;
import com.library.common.utils.JwtUtils;
import com.library.user.dto.LoginRequest;
import com.library.user.dto.RegisterRequest;
import com.library.user.dto.UserInfoResponse;
import com.library.user.mapper.UserMapper;
import com.library.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Override
    public String login(LoginRequest request) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", request.getUsername());
        queryWrapper.eq("is_deleted", false);
        
        User user = userMapper.selectOne(queryWrapper);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        if (!user.getIsActive()) {
            throw new BusinessException("用户已被禁用");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        
        String token = jwtUtils.generateToken(user.getUsername(), user.getId(), user.getRole().name());
        
        redisTemplate.opsForValue().set("user:token:" + user.getId(), token, 24, TimeUnit.HOURS);
        redisTemplate.opsForValue().set("user:info:" + user.getId(), user, 24, TimeUnit.HOURS);
        
        return token;
    }
    
    @Override
    public UserInfoResponse register(RegisterRequest request) {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", request.getUsername());
        queryWrapper.eq("is_deleted", false);
        
        User existUser = userMapper.selectOne(queryWrapper);
        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }
        
        User user = new User();
        BeanUtils.copyProperties(request, user);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        
        int result = userMapper.insert(user);
        if (result <= 0) {
            throw new BusinessException("注册失败");
        }
        
        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(user, response);
        return response;
    }
    
    @Override
    public UserInfoResponse getUserInfo(Long userId) {
        User user = (User) redisTemplate.opsForValue().get("user:info:" + userId);
        if (user == null) {
            user = userMapper.selectById(userId);
            if (user == null) {
                throw new BusinessException("用户不存在");
            }
            redisTemplate.opsForValue().set("user:info:" + userId, user, 1, TimeUnit.HOURS);
        }
        
        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(user, response);
        return response;
    }
    
    @Override
    public UserInfoResponse updateUser(Long userId, User user) {
        User existUser = userMapper.selectById(userId);
        if (existUser == null) {
            throw new BusinessException("用户不存在");
        }
        
        if (StringUtils.hasText(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        
        user.setId(userId);
        int result = userMapper.updateById(user);
        if (result <= 0) {
            throw new BusinessException("更新失败");
        }
        
        redisTemplate.delete("user:info:" + userId);
        
        User updatedUser = userMapper.selectById(userId);
        UserInfoResponse response = new UserInfoResponse();
        BeanUtils.copyProperties(updatedUser, response);
        return response;
    }
    
    @Override
    public void deleteUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        int result = userMapper.deleteById(userId);
        if (result <= 0) {
            throw new BusinessException("删除失败");
        }
        
        redisTemplate.delete("user:info:" + userId);
        redisTemplate.delete("user:token:" + userId);
    }
    
    @Override
    public Page<UserInfoResponse> getUserList(Integer current, Integer size, String keyword) {
        Page<User> page = new Page<>(current, size);
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        
        if (StringUtils.hasText(keyword)) {
            queryWrapper.and(wrapper -> wrapper
                .like("username", keyword)
                .or()
                .like("real_name", keyword)
                .or()
                .like("email", keyword)
            );
        }
        
        queryWrapper.eq("is_deleted", false);
        queryWrapper.orderByDesc("create_time");
        
        Page<User> userPage = userMapper.selectPage(page, queryWrapper);
        
        Page<UserInfoResponse> responsePage = new Page<>();
        BeanUtils.copyProperties(userPage, responsePage, "records");
        
        responsePage.setRecords(userPage.getRecords().stream()
            .map(user -> {
                UserInfoResponse response = new UserInfoResponse();
                BeanUtils.copyProperties(user, response);
                return response;
            })
            .toList());
        
        return responsePage;
    }
    
    @Override
    public void changeUserStatus(Long userId, Boolean status) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        user.setIsActive(status);
        int result = userMapper.updateById(user);
        if (result <= 0) {
            throw new BusinessException("状态更新失败");
        }
        
        redisTemplate.delete("user:info:" + userId);
        
        if (!status) {
            redisTemplate.delete("user:token:" + userId);
        }
    }
    
    @Override
    public boolean hasPermission(Long userId, String permission) {
        User user = (User) redisTemplate.opsForValue().get("user:info:" + userId);
        if (user == null) {
            user = userMapper.selectById(userId);
            if (user == null) {
                return false;
            }
            redisTemplate.opsForValue().set("user:info:" + userId, user, 1, TimeUnit.HOURS);
        }
        
        if (!user.getIsActive()) {
            return false;
        }
        
        UserRole role = user.getRole();
        return switch (permission) {
            case "BORROW_BOOK", "RETURN_BOOK" -> 
                role == UserRole.STUDENT || role == UserRole.TEACHER || role == UserRole.ADMIN;
            case "MANAGE_BOOK", "MANAGE_USER" -> 
                role == UserRole.TEACHER || role == UserRole.ADMIN;
            case "ADMIN_OPERATION" -> 
                role == UserRole.ADMIN;
            default -> false;
        };
    }
}