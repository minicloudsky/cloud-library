#!/bin/bash

# 本地启动图书管理系统

set -e

echo "正在启动图书管理系统..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "错误: Docker没有运行，请先启动Docker"
    exit 1
fi

# 停止现有容器
echo "停止现有容器..."
docker-compose down

# 清理Docker缓存（可选）
echo "清理Docker构建缓存..."
docker system prune -f

# 启动基础设施服务
echo "启动MySQL和Redis..."
docker-compose up -d mysql redis

# 等待MySQL启动
echo "等待MySQL启动..."
sleep 30

# 检查MySQL是否就绪
until docker-compose exec mysql mysqladmin ping -h"localhost" --silent; do
    echo "等待MySQL启动..."
    sleep 5
done

echo "MySQL已就绪"

# 构建并启动后端服务
echo "构建并启动后端服务..."
docker-compose up -d --build backend

# 等待后端服务启动
echo "等待后端服务启动..."
sleep 30

# 构建并启动前端服务
echo "构建并启动前端服务..."
docker-compose up -d --build frontend

echo "等待服务启动完成..."
sleep 10

echo ""
echo "🎉 图书管理系统启动成功!"
echo ""
echo "📱 访问地址:"
echo "前端: http://localhost:3000"
echo "后端API: http://localhost:8080"
echo ""
echo "🔑 默认账户:"
echo "管理员: admin / admin"
echo "老师: teacher01 / admin"
echo "学生: student01 / admin"
echo ""
echo "📋 管理命令:"
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
echo "重启服务: docker-compose restart"
echo ""