# 图书管理系统

一个基于微服务架构的图书管理系统，使用 Spring Boot + Dubbo + MyBatis + React + Ant Design + TypeScript 构建。

## 系统架构

### 后端技术栈
- **微服务框架**: Spring Boot 2.7.14
- **RPC框架**: Apache Dubbo 3.2.4
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **ORM框架**: MyBatis Plus 3.5.3.2
- **权限认证**: JWT + Spring Security
- **连接池**: Druid

### 前端技术栈
- **前端框架**: React 18.2.0
- **UI组件库**: Ant Design 5.12.8
- **开发语言**: TypeScript 4.9.5
- **HTTP客户端**: Axios 1.6.2
- **路由管理**: React Router 6.20.1

### 部署技术栈
- **容器化**: Docker + Docker Compose
- **容器编排**: Kubernetes
- **反向代理**: Nginx

## 功能特性

### 用户权限管理
- **学生**: 可以借阅图书、还书
- **老师**: 可以上架、下架图书，维护图书信息，维护学生信息
- **管理员**: 支持所有操作

### 核心功能
- 用户登录/注册
- 图书信息管理（增删改查）
- 图书借阅/归还
- 借阅记录管理
- 用户管理（仅管理员）
- JWT权限控制

### 接口支持
- HTTP REST API
- Dubbo RPC接口

## 快速开始

### 环境要求
- JDK 11+
- Node.js 18+
- MySQL 8.0+
- Redis
- Docker (可选)
- Kubernetes (可选)

### 本地开发

#### 方式1: 开发模式（推荐）
```bash
# 一键启动开发环境（后端+前端+基础设施）
./start-dev.sh

# 停止开发环境
./stop-dev.sh
```

#### 方式2: 手动启动
```bash
# 1. 启动基础设施（MySQL + Redis）
docker-compose up -d mysql redis

# 2. 启动后端服务
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local

# 3. 启动前端服务（新终端）
cd frontend
npm install
npm start
```

#### 方式3: 纯本地环境
如果您有本地MySQL和Redis：
```bash
# 1. 创建数据库并执行初始化脚本
mysql -u root -p < backend/database/sql/init.sql

# 2. 修改 backend/library-service/src/main/resources/application-local.yml
# 3. 启动后端和前端（同方式2）
```

### Docker部署

#### 1. 使用Docker Compose
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### Kubernetes部署

#### 1. 部署到K8s集群
```bash
# 执行部署脚本
./deploy-k8s.sh

# 或者手动部署
kubectl apply -f k8s/namespace/namespace.yaml
kubectl apply -f k8s/infrastructure/
kubectl apply -f k8s/services/
```

#### 2. 配置访问
```bash
# 获取Ingress IP
kubectl get ingress -n library-system

# 配置hosts文件
echo "<INGRESS_IP> library.local" >> /etc/hosts
echo "<INGRESS_IP> api.library.local" >> /etc/hosts
```

## 默认账户

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin | 管理员 | 系统管理员账户 |
| teacher01 | admin | 老师 | 教师账户 |
| student01 | admin | 学生 | 学生账户 |

## API文档

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/current` - 获取当前用户信息

### 图书管理接口
- `GET /api/books/page` - 分页查询图书
- `GET /api/books/{id}` - 获取图书详情
- `POST /api/books` - 添加图书（老师/管理员）
- `PUT /api/books/{id}` - 更新图书（老师/管理员）
- `DELETE /api/books/{id}` - 删除图书（管理员）

### 借阅管理接口
- `POST /api/borrow/{bookId}` - 借阅图书
- `PUT /api/borrow/return/{recordId}` - 归还图书
- `GET /api/borrow/records` - 查询所有借阅记录（老师/管理员）
- `GET /api/borrow/my-records` - 查询我的借阅记录

### 用户管理接口
- `GET /api/users/page` - 分页查询用户（管理员）
- `GET /api/users/{id}` - 获取用户详情（管理员）
- `PUT /api/users/{id}/status` - 更新用户状态（管理员）

## Dubbo接口

所有HTTP接口都有对应的Dubbo接口实现，可以通过Dubbo客户端调用。

## 项目结构

```
cloud-library/
├── backend/                    # 后端服务
│   ├── database/              # 数据库脚本
│   ├── library-service/       # 图书管理服务
│   │   ├── src/main/java/com/library/
│   │   │   ├── controller/    # REST控制器
│   │   │   ├── service/       # 业务服务层
│   │   │   ├── mapper/        # 数据访问层
│   │   │   ├── entity/        # 实体类
│   │   │   ├── dto/           # 数据传输对象
│   │   │   ├── enums/         # 枚举类
│   │   │   ├── config/        # 配置类
│   │   │   ├── security/      # 安全配置
│   │   │   ├── utils/         # 工具类
│   │   │   └── dubbo/         # Dubbo接口
│   │   └── src/main/resources/
│   ├── pom.xml                # Maven父项目配置
│   └── Dockerfile             # Docker构建文件
├── frontend/                  # 前端应用
│   ├── public/               # 静态资源
│   ├── src/
│   │   ├── components/       # 公共组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API服务
│   │   ├── utils/           # 工具函数
│   │   └── types/           # TypeScript类型定义
│   ├── package.json         # Node.js依赖
│   ├── Dockerfile          # Docker构建文件
│   └── nginx.conf          # Nginx配置
├── k8s/                    # Kubernetes配置
│   ├── namespace/          # 命名空间
│   ├── infrastructure/     # 基础设施
│   └── services/          # 应用服务
├── docker-compose.yml     # Docker Compose配置
├── deploy-k8s.sh         # K8s部署脚本
└── README.md            # 项目说明
```

## 开发指南

### 后端开发
1. 遵循RESTful API设计规范
2. 使用MyBatis Plus简化数据库操作
3. 统一异常处理和返回格式
4. JWT token认证和权限控制
5. 同时提供HTTP和Dubbo接口

### 前端开发
1. 使用TypeScript开发，保证代码类型安全
2. 组件化开发，遵循React最佳实践
3. 使用Ant Design组件库，保证UI一致性
4. 统一API调用和错误处理
5. 响应式设计，适配不同屏幕尺寸

### 数据库设计
1. 使用utf8mb4字符集
2. 合理设计索引提高查询性能
3. 使用枚举类型提高数据一致性
4. 记录创建时间和更新时间

## 许可证

MIT License