# 🐳 Docker本地部署完成指南

## ✅ 改造完成内容

### 1. Docker化支持
- ✅ 为所有服务创建了优化的Dockerfile
- ✅ 创建了通用的多阶段构建 `Dockerfile.common`
- ✅ 配置了完整的 `docker-compose.yml`

### 2. 本地配置文件
- ✅ `application-local.yml` - 每个服务的本地配置
- ✅ 禁用Nacos依赖，直连数据库
- ✅ 网关服务支持容器内服务发现

### 3. 自动化脚本
- ✅ `start-local.sh` - 一键启动所有服务
- ✅ `stop-local.sh` - 停止和清理脚本  
- ✅ `dev-local.sh` - 开发模式（只启动基础设施）
- ✅ `test-api.sh` - API功能测试脚本

### 4. 配置文件
- ✅ `.env.local` - 环境变量配置
- ✅ `README-LOCAL.md` - 详细的本地部署文档

## 🚀 快速使用

### 方式一：Docker一键部署（生产模拟）
```bash
./start-local.sh
```
等待启动完成后，访问 http://localhost:8080

### 方式二：开发模式（推荐开发时使用）
```bash
# 1. 启动基础设施
./dev-local.sh

# 2. 在IDE中设置Profile为 'local' 启动服务
```

### 方式三：API测试
```bash
./test-api.sh
```

## 📁 新增文件列表

### Docker相关
```
├── Dockerfile.common          # 通用构建文件
├── docker-compose.yml         # Docker Compose配置
├── user-service/Dockerfile    # 用户服务Docker文件
├── book-service/Dockerfile    # 图书服务Docker文件
├── borrow-service/Dockerfile  # 借阅服务Docker文件
└── gateway-service/Dockerfile # 网关服务Docker文件
```

### 本地配置
```
├── user-service/src/main/resources/application-local.yml
├── book-service/src/main/resources/application-local.yml
├── borrow-service/src/main/resources/application-local.yml
├── gateway-service/src/main/resources/application-local.yml
└── .env.local
```

### 脚本文件
```
├── start-local.sh    # 一键启动
├── stop-local.sh     # 停止清理
├── dev-local.sh      # 开发模式
└── test-api.sh       # API测试
```

### 文档
```
├── README-LOCAL.md   # 本地部署详细指南
└── DOCKER-DEPLOY.md  # 本文档
```

## 🎯 主要改进点

### 1. 去除Nacos依赖
- 本地环境不再需要启动Nacos
- 网关直连各个服务
- 简化了本地开发复杂度

### 2. 优化的Docker构建
- 多阶段构建减少镜像大小
- 通用构建文件避免重复
- 健康检查确保服务可用

### 3. 智能启动脚本
- 自动等待依赖服务就绪
- 详细的启动日志和错误提示
- 彩色输出增强用户体验

### 4. 灵活的部署模式
- 完全Docker化部署
- IDE开发调试模式
- API自动化测试

## 🔧 技术细节

### Spring Profile机制
- `default`: K8s生产环境，使用Nacos
- `local`: 本地开发环境，直连服务

### 网关路由配置
```yaml
# 支持环境变量覆盖
uri: ${SPRING_CLOUD_GATEWAY_ROUTES_0_URI:http://localhost:8081}
```

### Docker网络
- 创建了独立的 `library-network`
- 容器间可通过服务名通信
- 宿主机可通过localhost访问

### 健康检查
- 所有服务都配置了健康检查
- 启动脚本会等待服务就绪
- 支持超时和重试机制

## 📊 服务端口映射

| 服务 | 容器端口 | 宿主机端口 | 说明 |
|------|----------|------------|------|
| MySQL | 3306 | 3306 | 数据库 |
| Redis | 6379 | 6379 | 缓存 |
| Gateway | 8080 | 8080 | API网关 |
| User Service | 8081 | 8081 | 用户服务 |
| Book Service | 8082 | 8082 | 图书服务 |
| Borrow Service | 8083 | 8083 | 借阅服务 |

## 🐛 故障排除

### 常见问题
1. **端口冲突**: 使用 `lsof -i :端口号` 检查占用
2. **内存不足**: 使用 `docker system prune -a` 清理
3. **权限问题**: 确保Docker有足够权限
4. **构建失败**: 检查网络连接，重试构建

### 调试命令
```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs [service-name]

# 进入容器调试
docker exec -it library-mysql mysql -u root -p
docker exec -it library-redis redis-cli
```

## 🎉 总结

现在您的图书管理系统已经完全支持：

1. ✅ **Docker本地部署** - 一键启动完整环境
2. ✅ **开发友好** - IDE调试 + Docker基础设施
3. ✅ **生产就绪** - 保留K8s部署能力
4. ✅ **测试完备** - 自动化API测试
5. ✅ **文档齐全** - 详细的使用指南

通过 `./start-local.sh` 即可在Mac上启动完整的微服务环境！