-- 创建数据库
CREATE DATABASE IF NOT EXISTS library_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE library_system;

-- 用户表
CREATE TABLE `users` (
    `id` BIGINT(20) NOT NULL COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `role` TINYINT(1) NOT NULL COMMENT '角色：1-学生，2-老师，3-管理员',
    `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否激活：0-否，1-是',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0-否，1-是',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    KEY `idx_role` (`role`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 图书表
CREATE TABLE `books` (
    `id` BIGINT(20) NOT NULL COMMENT '图书ID',
    `title` VARCHAR(200) NOT NULL COMMENT '书名',
    `author` VARCHAR(100) NOT NULL COMMENT '作者',
    `isbn` VARCHAR(20) NOT NULL COMMENT 'ISBN',
    `publisher` VARCHAR(100) DEFAULT NULL COMMENT '出版社',
    `publish_date` DATE DEFAULT NULL COMMENT '出版日期',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '分类',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `price` DECIMAL(10,2) DEFAULT NULL COMMENT '价格',
    `stock` INT(11) NOT NULL DEFAULT 0 COMMENT '库存总量',
    `available_stock` INT(11) NOT NULL DEFAULT 0 COMMENT '可借数量',
    `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-可借阅，2-不可借阅，3-维护中，4-丢失',
    `book_cover` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0-否，1-是',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_isbn` (`isbn`),
    KEY `idx_title` (`title`),
    KEY `idx_author` (`author`),
    KEY `idx_category` (`category`),
    KEY `idx_status` (`status`),
    KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图书表';

-- 借阅记录表
CREATE TABLE `borrow_records` (
    `id` BIGINT(20) NOT NULL COMMENT '记录ID',
    `user_id` BIGINT(20) NOT NULL COMMENT '用户ID',
    `book_id` BIGINT(20) NOT NULL COMMENT '图书ID',
    `borrow_date` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '借阅日期',
    `due_date` DATETIME NOT NULL COMMENT '应还日期',
    `return_date` DATETIME DEFAULT NULL COMMENT '实际还书日期',
    `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-已借出，2-已归还，3-逾期，4-丢失，5-损坏',
    `fine_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '罚金金额',
    `remarks` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '是否删除：0-否，1-是',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_book_id` (`book_id`),
    KEY `idx_status` (`status`),
    KEY `idx_borrow_date` (`borrow_date`),
    KEY `idx_due_date` (`due_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='借阅记录表';

-- 插入初始管理员用户
INSERT INTO `users` (`id`, `username`, `password`, `real_name`, `email`, `role`, `is_active`) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKTn5MvPgXHkr8eLI5vSj.HTxWDa', '系统管理员', 'admin@library.com', 3, 1);
-- 密码是：admin123

-- 插入测试图书数据
INSERT INTO `books` (`id`, `title`, `author`, `isbn`, `publisher`, `publish_date`, `category`, `description`, `price`, `stock`, `available_stock`, `status`) VALUES
(1001, 'Java核心技术 卷I', 'Cay S. Horstmann', '9787111213826', '机械工业出版社', '2021-01-01', '计算机', 'Java编程经典教材', 89.00, 10, 10, 1),
(1002, 'Spring实战', 'Craig Walls', '9787115123456', '人民邮电出版社', '2020-06-01', '计算机', 'Spring框架实战指南', 79.00, 8, 8, 1),
(1003, '数据结构与算法', '严蔚敏', '9787302234567', '清华大学出版社', '2019-09-01', '计算机', '数据结构经典教材', 65.00, 15, 15, 1);