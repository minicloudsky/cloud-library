# 图书管理系统 - 微服务架构

基于Spring Boot + Dubbo + K8s的图书管理系统，支持用户权限管理、图书管理、借阅管理等核心功能。

## 🏗️ 系统架构

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Web Client │    │ Mobile App  │    │   Admin     │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                   ┌──────▼──────┐
                   │   Gateway   │
                   │  (Port 8080)│
                   └──────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│ User Service  │ │ Book Service  │ │Borrow Service │
│ (Port 8081)   │ │ (Port 8082)   │ │ (Port 8083)   │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│     MySQL     │ │     Redis     │ │     Nacos     │
│ (Port 3306)   │ │ (Port 6379)   │ │ (Port 8848)   │
└───────────────┘ └───────────────┘ └───────────────┘
```

## 🚀 核心功能

### 用户权限管理
- **学生**: 借阅图书、归还图书、查看个人借阅记录
- **老师**: 图书上下架、维护图书信息、维护学生信息
- **管理员**: 支持所有操作，包括用户管理、系统配置

### 图书管理
- 图书CRUD操作
- 图书分类管理
- 库存管理
- 图书状态管理

### 借阅管理
- 借书功能
- 还书功能
- 逾期处理
- 罚金计算

## 🛠️ 技术栈

- **后端框架**: Spring Boot 3.2.0
- **微服务**: Spring Cloud Alibaba + Dubbo 3.2.8
- **数据持久化**: MyBatis Plus 3.5.4 + MySQL 8.0
- **缓存**: Redis
- **注册中心**: Nacos
- **网关**: Spring Cloud Gateway
- **认证**: JWT
- **容器化**: Docker + Kubernetes
- **构建工具**: Maven

## 📦 项目结构

```
cloud-library/
├── library-common/          # 公共模块
│   ├── entity/             # 实体类
│   ├── enums/              # 枚举
│   ├── dto/                # 数据传输对象
│   ├── utils/              # 工具类
│   └── config/             # 配置类
├── user-service/            # 用户服务
├── book-service/            # 图书服务  
├── borrow-service/          # 借阅服务
├── gateway-service/         # 网关服务
├── database/                # 数据库脚本
├── k8s/                     # Kubernetes配置
│   ├── infrastructure/     # 基础设施
│   └── services/           # 微服务
└── deploy.sh               # 部署脚本
```

## 🔧 快速开始

### 本地开发环境 (推荐)

#### 环境要求
- Java 17+
- Maven 3.8+
- Docker 20.0+
- Docker Compose 2.0+

#### Docker一键部署
```bash
# 克隆项目
git clone <repository-url>
cd cloud-library

# 一键启动所有服务
./start-local.sh
```

#### IDE开发模式
```bash
# 只启动基础设施
./dev-local.sh

# 然后在IDE中启动各个服务(Profile: local)
```

详细本地开发指南请参考：[README-LOCAL.md](README-LOCAL.md)

### Kubernetes生产环境

#### 环境要求
- Java 17+
- Maven 3.8+
- Docker
- Kubernetes 1.20+
- kubectl

#### 部署步骤
```bash
# 编译项目
mvn clean compile -DskipTests

# 部署到K8s
./deploy.sh

# 验证部署
kubectl get pods -n library-system
kubectl get services -n library-system
```

## 🌐 API接口

### 网关地址
- **HTTP访问**: `http://<gateway-service-ip>:8080`

### 主要接口

#### 用户管理
- `POST /api/user/login` - 用户登录
- `POST /api/user/register` - 用户注册  
- `GET /api/user/info/{userId}` - 获取用户信息
- `GET /api/user/list` - 获取用户列表

#### 图书管理
- `POST /api/book` - 添加图书
- `PUT /api/book/{bookId}` - 更新图书
- `DELETE /api/book/{bookId}` - 删除图书
- `GET /api/book/{bookId}` - 获取图书详情
- `GET /api/book/list` - 获取图书列表
- `GET /api/book/available` - 获取可借图书

#### 借阅管理
- `POST /api/borrow` - 借阅图书
- `PUT /api/borrow/{recordId}/return` - 归还图书
- `GET /api/borrow/records` - 获取借阅记录

## 🔐 默认账号

- **管理员账号**: `admin`
- **管理员密码**: `admin123`

## 🔍 监控和日志

- **健康检查**: `GET /actuator/health`
- **服务信息**: `GET /actuator/info`
- **日志级别**: DEBUG (开发环境)

## 📄 许可证

本项目采用 MIT 许可证。