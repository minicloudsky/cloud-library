# 图书管理系统 - 本地开发部署指南

## 📋 环境要求

- **Java**: 17+
- **Maven**: 3.8+
- **Docker**: 20.0+
- **Docker Compose**: 2.0+ (或内置的 `docker compose`)
- **操作系统**: macOS, Linux, Windows (推荐macOS/Linux)

## 🚀 快速开始

### 方式一：Docker Compose 一键部署（推荐）

```bash
# 1. 克隆项目
git clone <repository-url>
cd cloud-library

# 2. 一键启动所有服务
./start-local.sh

# 3. 等待启动完成，访问服务
# 网关地址: http://localhost:8080
```

### 方式二：开发模式（IDE + Docker基础设施）

```bash
# 1. 只启动基础设施(MySQL + Redis)
./dev-local.sh

# 2. 在IDE中分别启动各个服务
# 设置Spring Profile为: local
# 启动顺序：user-service -> book-service -> borrow-service -> gateway-service
```

## 🔧 服务配置

### Spring Profile说明

- **默认profile**: 使用Nacos注册中心，适合K8s部署
- **local profile**: 本地开发模式，禁用Nacos，直连数据库

### 本地配置文件位置

```
user-service/src/main/resources/application-local.yml
book-service/src/main/resources/application-local.yml  
borrow-service/src/main/resources/application-local.yml
gateway-service/src/main/resources/application-local.yml
```

### 环境变量配置

可以通过`.env.local`文件自定义配置，主要参数：

```bash
MYSQL_ROOT_PASSWORD=123456
REDIS_HOST=localhost
USER_SERVICE_PORT=8081
BOOK_SERVICE_PORT=8082
BORROW_SERVICE_PORT=8083
GATEWAY_SERVICE_PORT=8080
```

## 🌐 服务访问地址

| 服务 | 端口 | 健康检查 | 描述 |
|------|------|----------|------|
| 网关服务 | 8080 | http://localhost:8080/actuator/health | API网关 |
| 用户服务 | 8081 | http://localhost:8081/actuator/health | 用户管理 |
| 图书服务 | 8082 | http://localhost:8082/actuator/health | 图书管理 |
| 借阅服务 | 8083 | http://localhost:8083/actuator/health | 借阅管理 |
| MySQL | 3306 | - | 数据库 |
| Redis | 6379 | - | 缓存 |

## 🔐 默认账号

- **管理员**: admin / admin123
- **数据库**: root / 123456

## 📡 API接口测试

### 1. 用户登录
```bash
curl -X POST http://localhost:8080/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 获取用户信息
```bash
# 先登录获取token，然后：
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/user/info/1
```

### 3. 获取图书列表
```bash
curl http://localhost:8080/api/book/available
```

### 4. 添加图书（需要管理员权限）
```bash
curl -X POST http://localhost:8080/api/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Spring Boot实战",
    "author": "张三",
    "isbn": "978-7-111-12345-6",
    "publisher": "机械工业出版社",
    "category": "计算机",
    "price": 89.00,
    "stock": 10,
    "status": "AVAILABLE"
  }'
```

## 🛠️ 开发调试

### 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs user-service
docker-compose logs book-service
docker-compose logs borrow-service
docker-compose logs gateway-service

# 实时跟踪日志
docker-compose logs -f gateway-service
```

### 重启服务

```bash
# 重启特定服务
docker-compose restart user-service

# 重启所有服务
docker-compose restart
```

### 数据库操作

```bash
# 连接MySQL
docker exec -it library-mysql mysql -u root -p123456 library_system

# 备份数据
docker exec library-mysql mysqldump -u root -p123456 library_system > backup.sql

# 恢复数据
docker exec -i library-mysql mysql -u root -p123456 library_system < backup.sql
```

### Redis操作

```bash
# 连接Redis
docker exec -it library-redis redis-cli

# 查看所有key
docker exec library-redis redis-cli keys "*"

# 清空缓存
docker exec library-redis redis-cli flushall
```

## 🐛 常见问题

### 1. 端口占用
```bash
# 检查端口占用
lsof -i :8080
lsof -i :3306

# 杀死占用进程
kill -9 <PID>
```

### 2. Docker权限问题
```bash
# macOS/Linux 添加用户到docker组
sudo usermod -aG docker $USER
# 重新登录生效
```

### 3. 服务启动失败
```bash
# 查看详细日志
docker-compose logs <service-name>

# 重新构建镜像
docker-compose build --no-cache <service-name>
```

### 4. 数据库连接失败
```bash
# 检查MySQL状态
docker ps | grep mysql
docker logs library-mysql

# 手动测试连接
mysql -h 127.0.0.1 -P 3306 -u root -p123456
```

### 5. 内存不足
```bash
# 清理Docker缓存
docker system prune -a
docker volume prune
```

## 🧪 测试数据

系统启动时会自动初始化以下测试数据：

### 用户
- 管理员: admin / admin123

### 图书
- Java核心技术 卷I (库存10本)
- Spring实战 (库存8本) 
- 数据结构与算法 (库存15本)

## 📝 开发指南

### 添加新的微服务

1. 创建新的Maven模块
2. 配置Dockerfile
3. 更新docker-compose.yml
4. 配置网关路由
5. 更新启动脚本

### 修改数据库结构

1. 更新 `database/sql/init.sql`
2. 修改实体类
3. 重启MySQL容器

### 环境配置优先级

1. 环境变量
2. application-local.yml
3. application.yml

## 🔄 停止服务

```bash
# 停止所有服务
./stop-local.sh

# 或手动停止
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```

## 📚 更多资源

- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [Spring Cloud Gateway文档](https://spring.io/projects/spring-cloud-gateway)
- [MyBatis Plus文档](https://baomidou.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)