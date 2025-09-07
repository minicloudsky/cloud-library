#!/bin/bash

# 图书管理系统本地开发环境启动脚本
# 此脚本只启动基础设施(MySQL, Redis)，业务服务通过IDE运行

set -e

echo "🚀 启动本地开发环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 设置Docker Compose命令
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
fi

echo "🧹 清理旧的基础设施容器..."
docker stop library-mysql library-redis 2>/dev/null || true
docker rm library-mysql library-redis 2>/dev/null || true

echo "🗄️ 启动MySQL..."
docker run -d \
  --name library-mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=library_system \
  -e MYSQL_CHARACTER_SET_SERVER=utf8mb4 \
  -e MYSQL_COLLATION_SERVER=utf8mb4_unicode_ci \
  -v library_mysql_data:/var/lib/mysql \
  -v "$(pwd)/database/sql/init.sql:/docker-entrypoint-initdb.d/init.sql" \
  --restart unless-stopped \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password

echo "🗂️ 启动Redis..."
docker run -d \
  --name library-redis \
  -p 6379:6379 \
  -v library_redis_data:/data \
  --restart unless-stopped \
  redis:7.0-alpine

echo "⏳ 等待数据库启动..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker exec library-mysql mysqladmin ping -h"localhost" --silent 2>/dev/null; then
        echo "✅ MySQL已就绪"
        break
    fi
    printf "."
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo "❌ MySQL启动超时"
    exit 1
fi

echo "⏳ 等待Redis启动..."
timeout=30
counter=0
while [ $counter -lt $timeout ]; do
    if docker exec library-redis redis-cli ping 2>/dev/null | grep -q PONG; then
        echo "✅ Redis已就绪"
        break
    fi
    printf "."
    sleep 1
    counter=$((counter + 1))
done

if [ $counter -ge $timeout ]; then
    echo "❌ Redis启动超时"
    exit 1
fi

echo ""
echo "🎉 开发环境基础设施启动成功！"
echo ""
echo "🔧 基础设施信息："
echo "  🗄️  MySQL: localhost:3306 (root/123456)"
echo "  🗂️  Redis: localhost:6379"
echo ""
echo "🚀 现在可以在IDE中启动业务服务："
echo "  1. 设置Spring Profile为 'local'"
echo "  2. 启动 UserServiceApplication (端口: 8081)"
echo "  3. 启动 BookServiceApplication (端口: 8082)"
echo "  4. 启动 BorrowServiceApplication (端口: 8083)"
echo "  5. 启动 GatewayServiceApplication (端口: 8080)"
echo ""
echo "🔐 默认管理员账号："
echo "  👤 用户名: admin"
echo "  🔑 密码: admin123"
echo ""
echo "📋 常用命令："
echo "  查看MySQL日志: docker logs library-mysql"
echo "  查看Redis日志: docker logs library-redis"
echo "  停止基础设施: docker stop library-mysql library-redis"
echo "  完全清理: docker rm library-mysql library-redis && docker volume prune"