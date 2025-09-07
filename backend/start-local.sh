#!/bin/bash

# 图书管理系统本地Docker部署脚本

set -e

echo "🚀 开始启动图书管理系统本地环境..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker未运行，请先启动Docker"
    exit 1
fi

# 检查Docker Compose是否可用
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose未安装"
    exit 1
fi

# 设置Docker Compose命令
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
fi

echo "📋 检查项目结构..."
if [ ! -f "pom.xml" ]; then
    echo "❌ 请在项目根目录下运行此脚本"
    exit 1
fi

echo "🧹 清理旧容器和镜像..."
$COMPOSE_CMD down -v --remove-orphans 2>/dev/null || true
docker system prune -f --volumes 2>/dev/null || true

echo "🔨 构建并启动所有服务..."
$COMPOSE_CMD up --build -d

echo "⏳ 等待服务启动..."
echo "正在启动基础设施服务(MySQL, Redis)..."

# 等待MySQL和Redis就绪
while ! docker exec library-mysql mysqladmin ping -h"localhost" --silent 2>/dev/null; do
    printf "."
    sleep 2
done
echo -e "\n✅ MySQL已就绪"

while ! docker exec library-redis redis-cli ping 2>/dev/null | grep -q PONG; do
    printf "."
    sleep 1
done
echo "✅ Redis已就绪"

echo "正在启动业务服务..."

# 等待业务服务就绪
services=("user-service:8081" "book-service:8082" "borrow-service:8083")
for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    echo "等待 $name 服务启动..."
    
    timeout=180
    counter=0
    while [ $counter -lt $timeout ]; do
        if curl -s http://localhost:$port/actuator/health > /dev/null 2>&1; then
            echo "✅ $name 服务已就绪"
            break
        fi
        printf "."
        sleep 2
        counter=$((counter + 2))
    done
    
    if [ $counter -ge $timeout ]; then
        echo "❌ $name 服务启动超时"
        echo "📋 查看服务日志："
        $COMPOSE_CMD logs $name
        exit 1
    fi
done

# 等待网关服务就绪
echo "正在启动网关服务..."
timeout=120
counter=0
while [ $counter -lt $timeout ]; do
    if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
        echo "✅ 网关服务已就绪"
        break
    fi
    printf "."
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo "❌ 网关服务启动超时"
    echo "📋 查看网关服务日志："
    $COMPOSE_CMD logs gateway-service
    exit 1
fi

echo ""
echo "🎉 图书管理系统启动成功！"
echo ""
echo "📡 服务访问地址："
echo "  🌐 网关服务: http://localhost:8080"
echo "  👤 用户服务: http://localhost:8081"
echo "  📚 图书服务: http://localhost:8082"
echo "  📖 借阅服务: http://localhost:8083"
echo ""
echo "🔧 管理工具："
echo "  🗄️  MySQL: localhost:3306 (root/123456)"
echo "  🗂️  Redis: localhost:6379"
echo ""
echo "🔐 默认管理员账号："
echo "  👤 用户名: admin"
echo "  🔑 密码: admin123"
echo ""
echo "📋 常用命令："
echo "  查看服务状态: $COMPOSE_CMD ps"
echo "  查看日志: $COMPOSE_CMD logs [服务名]"
echo "  停止服务: $COMPOSE_CMD down"
echo "  重启服务: $COMPOSE_CMD restart [服务名]"
echo ""
echo "🧪 API测试示例："
echo "  登录: curl -X POST http://localhost:8080/api/user/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
echo "  获取图书列表: curl http://localhost:8080/api/book/available"
echo ""

# 显示服务状态
echo "📊 当前服务状态："
$COMPOSE_CMD ps

echo ""
echo "💡 提示: 使用 './stop-local.sh' 停止所有服务"