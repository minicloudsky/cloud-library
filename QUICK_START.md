# 快速启动指南

## 🚀 一键启动（推荐方式）

### 使用 Docker Compose（最简单）

```bash
# 1. 启动基础设施
docker-compose up -d mysql redis

# 2. 等待MySQL启动（约30秒）
sleep 30

# 3. 启动所有服务
docker-compose up -d
```

访问地址：
- 前端：http://localhost:3000
- 后端API：http://localhost:8080

### 开发模式启动

```bash
# 1. 启动基础设施
docker-compose up -d mysql redis

# 2. 启动后端（新终端）
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local

# 3. 启动前端（新终端）
cd frontend
npm install
npm start
```

## 🔧 环境要求

### Docker方式
- Docker & Docker Compose

### 开发方式
- JDK 8+ 
- Node.js 16+
- Maven 3.6+

## 🔑 默认登录账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin | 管理员 |
| teacher01 | admin | 老师 |
| student01 | admin | 学生 |

## 📱 功能说明

### 学生权限
- ✅ 浏览图书
- ✅ 借阅图书
- ✅ 归还图书
- ✅ 查看借阅记录

### 老师权限
- ✅ 学生所有功能
- ✅ 添加/编辑图书
- ✅ 上架/下架图书
- ✅ 查看所有借阅记录

### 管理员权限
- ✅ 老师所有功能
- ✅ 删除图书
- ✅ 用户管理
- ✅ 系统管理

## 🐛 故障排除

### 1. 端口占用
```bash
# 查看端口占用
lsof -i :3000
lsof -i :8080
lsof -i :3306

# 杀死进程
kill -9 <PID>
```

### 2. Docker问题
```bash
# 清理Docker环境
docker-compose down
docker system prune -f

# 重新启动
docker-compose up -d
```

### 3. 数据库连接问题
```bash
# 测试MySQL连接
docker-compose exec mysql mysql -uroot -proot123456 -e "SELECT 1"

# 查看MySQL日志
docker-compose logs mysql
```

### 4. 后端启动失败
```bash
# 查看后端日志
docker-compose logs backend

# 手动启动后端
cd backend
mvn clean compile
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

## 📋 管理命令

```bash
# 查看所有服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service-name]

# 重启服务
docker-compose restart [service-name]

# 停止所有服务
docker-compose down

# 完全清理（包括数据）
docker-compose down -v
```

## 🎯 API测试

```bash
# 登录测试
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# 获取图书列表
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:8080/api/books/page
```