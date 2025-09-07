#!/bin/bash

# 图书管理系统本地Docker停止脚本

echo "🛑 正在停止图书管理系统本地环境..."

# 设置Docker Compose命令
COMPOSE_CMD="docker-compose"
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
fi

# 停止并删除容器
echo "📦 停止所有容器..."
$COMPOSE_CMD down

# 可选：删除数据卷
read -p "是否删除数据卷(将清除所有数据)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ 删除数据卷..."
    $COMPOSE_CMD down -v
    docker volume prune -f
    echo "✅ 数据卷已删除"
fi

# 可选：清理Docker镜像
read -p "是否清理Docker镜像? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理Docker镜像..."
    docker image prune -f
    # 删除项目相关的镜像
    docker images | grep "cloud-library" | awk '{print $3}' | xargs -r docker rmi -f
    echo "✅ Docker镜像已清理"
fi

echo ""
echo "✅ 图书管理系统已停止"
echo "💡 使用 './start-local.sh' 重新启动服务"