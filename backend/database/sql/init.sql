-- 图书管理系统数据库初始化脚本
CREATE DATABASE IF NOT EXISTS `library_management` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `library_management`;

-- 用户表
CREATE TABLE `users` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` varchar(50) NOT NULL COMMENT '用户名',
    `password` varchar(255) NOT NULL COMMENT '密码',
    `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
    `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
    `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
    `student_id` varchar(20) DEFAULT NULL COMMENT '学号/工号',
    `role` enum('STUDENT','TEACHER','ADMIN') NOT NULL DEFAULT 'STUDENT' COMMENT '用户角色',
    `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
    `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_username` (`username`),
    UNIQUE KEY `idx_email` (`email`),
    KEY `idx_student_id` (`student_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 图书表
CREATE TABLE `books` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '图书ID',
    `isbn` varchar(20) DEFAULT NULL COMMENT 'ISBN号',
    `title` varchar(200) NOT NULL COMMENT '书名',
    `author` varchar(100) DEFAULT NULL COMMENT '作者',
    `publisher` varchar(100) DEFAULT NULL COMMENT '出版社',
    `publish_date` date DEFAULT NULL COMMENT '出版日期',
    `category` varchar(50) DEFAULT NULL COMMENT '分类',
    `price` decimal(10,2) DEFAULT NULL COMMENT '价格',
    `total_quantity` int NOT NULL DEFAULT '1' COMMENT '总数量',
    `available_quantity` int NOT NULL DEFAULT '1' COMMENT '可借数量',
    `description` text COMMENT '图书描述',
    `cover_url` varchar(500) DEFAULT NULL COMMENT '封面图片URL',
    `location` varchar(100) DEFAULT NULL COMMENT '存放位置',
    `status` enum('AVAILABLE','UNAVAILABLE','DELETED') NOT NULL DEFAULT 'AVAILABLE' COMMENT '状态',
    `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_isbn` (`isbn`),
    KEY `idx_title` (`title`),
    KEY `idx_author` (`author`),
    KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图书表';

-- 借阅记录表
CREATE TABLE `borrow_records` (
    `id` bigint NOT NULL AUTO_INCREMENT COMMENT '借阅记录ID',
    `user_id` bigint NOT NULL COMMENT '用户ID',
    `book_id` bigint NOT NULL COMMENT '图书ID',
    `borrow_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '借阅日期',
    `due_date` timestamp NOT NULL COMMENT '应还日期',
    `return_date` timestamp NULL DEFAULT NULL COMMENT '实际还书日期',
    `status` enum('BORROWED','RETURNED','OVERDUE','LOST') NOT NULL DEFAULT 'BORROWED' COMMENT '借阅状态',
    `fine_amount` decimal(10,2) DEFAULT '0.00' COMMENT '罚金金额',
    `remark` varchar(500) DEFAULT NULL COMMENT '备注',
    `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_book_id` (`book_id`),
    KEY `idx_status` (`status`),
    KEY `idx_borrow_date` (`borrow_date`),
    CONSTRAINT `fk_borrow_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_borrow_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='借阅记录表';

-- 插入默认管理员用户
INSERT INTO `users` (`username`, `password`, `email`, `real_name`, `role`, `status`) 
VALUES ('admin', '$2a$10$9ZhDOBp.sRKat4l14ygu/.LscYlX1aMkLJJl.qjPH.W0GJ4FbKUby', 'admin@library.com', '系统管理员', 'ADMIN', 1);

-- 插入测试数据
-- 测试用户
INSERT INTO `users` (`username`, `password`, `email`, `real_name`, `student_id`, `role`, `status`) VALUES
('teacher01', '$2a$10$9ZhDOBp.sRKat4l14ygu/.LscYlX1aMkLJJl.qjPH.W0GJ4FbKUby', 'teacher01@library.com', '张老师', 'T001', 'TEACHER', 1),
('student01', '$2a$10$9ZhDOBp.sRKat4l14ygu/.LscYlX1aMkLJJl.qjPH.W0GJ4FbKUby', 'student01@library.com', '李同学', '20230001', 'STUDENT', 1),
('student02', '$2a$10$9ZhDOBp.sRKat4l14ygu/.LscYlX1aMkLJJl.qjPH.W0GJ4FbKUby', 'student02@library.com', '王同学', '20230002', 'STUDENT', 1);

-- 测试图书
INSERT INTO `books` (`isbn`, `title`, `author`, `publisher`, `publish_date`, `category`, `price`, `total_quantity`, `available_quantity`, `description`, `location`) VALUES
('9787111544937', 'Java核心技术', '凯·霍斯特曼', '机械工业出版社', '2020-01-01', '计算机', 108.00, 5, 5, 'Java编程经典教材', 'A区1层001'),
('9787121283819', 'Spring Boot实战', '克雷格·沃斯', '电子工业出版社', '2019-06-01', '计算机', 89.00, 3, 3, 'Spring Boot开发指南', 'A区1层002'),
('9787030123456', '数据结构与算法', '严蔚敏', '清华大学出版社', '2018-03-01', '计算机', 75.50, 10, 10, '数据结构经典教材', 'B区2层001'),
('9787508353685', '设计模式', 'GOF', '中国电力出版社', '2017-09-01', '计算机', 99.00, 2, 2, '设计模式经典著作', 'A区1层003');