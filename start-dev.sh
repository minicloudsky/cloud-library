#!/bin/bash

# 本地开发模式启动（不使用Docker）

set -e

echo "🚀 启动图书管理系统开发环境..."

# 检查Java环境
if ! command -v java &> /dev/null; then
    echo "❌ 错误: Java未安装，请先安装JDK 11+"
    exit 1
fi

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js未安装，请先安装Node.js 16+"
    exit 1
fi

# 检查Maven环境
if ! command -v mvn &> /dev/null; then
    echo "❌ 错误: Maven未安装，请先安装Maven"
    exit 1
fi

echo "✅ 环境检查通过"

# 启动基础设施服务
echo "📦 启动基础设施服务..."
docker-compose up -d mysql redis

# 等待MySQL启动
echo "⏳ 等待MySQL启动..."
sleep 20

# 检查MySQL是否就绪
until docker-compose exec mysql mysqladmin ping -h"localhost" --silent; do
    echo "⏳ 等待MySQL启动..."
    sleep 5
done

echo "✅ MySQL已就绪"

# 启动后端服务
echo "🔧 启动后端服务..."
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 30

# 启动前端服务
echo "🎨 启动前端服务..."
cd frontend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 开发环境启动成功!"
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
echo "📋 停止服务:"
echo "Ctrl+C 或运行: ./stop-dev.sh"
echo ""

# 创建停止脚本
cat > stop-dev.sh << 'EOF'
#!/bin/bash
echo "🛑 停止开发环境..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
docker-compose stop mysql redis
echo "✅ 开发环境已停止"
EOF

chmod +x stop-dev.sh

# 等待用户中断
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose stop mysql redis; exit' INT
wait