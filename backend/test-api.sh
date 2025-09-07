#!/bin/bash

# 图书管理系统API测试脚本

# 设置API基础URL
BASE_URL="http://localhost:8080"
API_BASE="${BASE_URL}/api"

echo "🧪 图书管理系统API测试"
echo "================================"

# 颜色输出函数
success() { echo -e "✅ \033[32m$1\033[0m"; }
error() { echo -e "❌ \033[31m$1\033[0m"; }
info() { echo -e "ℹ️  \033[34m$1\033[0m"; }
warning() { echo -e "⚠️  \033[33m$1\033[0m"; }

# 检查服务是否可用
check_service() {
    if ! curl -s ${BASE_URL}/actuator/health > /dev/null; then
        error "服务未启动，请先运行 './start-local.sh'"
        exit 1
    fi
    success "服务运行正常"
}

# 用户登录并获取token
login() {
    info "正在登录..."
    
    response=$(curl -s -X POST \
        ${API_BASE}/user/login \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123"}')
    
    if echo "$response" | grep -q '"code":200'; then
        # 提取token
        TOKEN=$(echo "$response" | grep -o '"data":"[^"]*"' | cut -d'"' -f4)
        success "登录成功"
        info "Token: ${TOKEN:0:20}..."
        return 0
    else
        error "登录失败: $response"
        return 1
    fi
}

# 测试用户API
test_user_api() {
    info "测试用户管理API..."
    
    # 获取用户信息
    echo "📋 获取用户信息:"
    response=$(curl -s "${API_BASE}/user/info/1" \
        -H "Authorization: Bearer $TOKEN")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # 获取用户列表
    echo -e "\n📋 获取用户列表:"
    response=$(curl -s "${API_BASE}/user/list?current=1&size=5" \
        -H "Authorization: Bearer $TOKEN")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
}

# 测试图书API
test_book_api() {
    info "测试图书管理API..."
    
    # 获取可借图书列表
    echo "📚 获取可借图书列表:"
    response=$(curl -s "${API_BASE}/book/available?current=1&size=5")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # 添加新图书（需要管理员权限）
    echo -e "\n📚 添加新图书:"
    response=$(curl -s -X POST \
        ${API_BASE}/book \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{
            "title": "Docker实战指南",
            "author": "李四",
            "isbn": "978-7-111-99999-9",
            "publisher": "电子工业出版社",
            "category": "计算机",
            "description": "Docker容器化技术实战",
            "price": 79.00,
            "stock": 5,
            "status": "AVAILABLE"
        }')
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    
    # 获取新添加的图书ID
    if echo "$response" | grep -q '"code":200'; then
        BOOK_ID=$(echo "$response" | jq -r '.data.id' 2>/dev/null)
        success "图书添加成功，ID: $BOOK_ID"
    fi
}

# 测试借阅API
test_borrow_api() {
    info "测试借阅管理API..."
    
    if [ -n "$BOOK_ID" ]; then
        # 借阅图书
        echo "📖 借阅图书:"
        response=$(curl -s -X POST \
            ${API_BASE}/borrow \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "{\"bookId\": $BOOK_ID, \"userId\": 1}")
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        
        if echo "$response" | grep -q '"code":200'; then
            BORROW_ID=$(echo "$response" | jq -r '.data.id' 2>/dev/null)
            success "借阅成功，记录ID: $BORROW_ID"
        fi
    fi
    
    # 获取借阅记录
    echo -e "\n📖 获取借阅记录:"
    response=$(curl -s "${API_BASE}/borrow/records?current=1&size=5" \
        -H "Authorization: Bearer $TOKEN")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
}

# 测试网关路由
test_gateway() {
    info "测试网关路由..."
    
    services=("user-service:8081" "book-service:8082" "borrow-service:8083")
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        echo "🔗 测试 $name 直连:"
        if curl -s "http://localhost:$port/actuator/health" > /dev/null; then
            success "$name 可直接访问"
        else
            warning "$name 无法直接访问"
        fi
    done
}

# 性能测试
performance_test() {
    info "简单性能测试..."
    
    echo "📊 测试登录接口性能(10次请求):"
    time for i in {1..10}; do
        curl -s -X POST \
            ${API_BASE}/user/login \
            -H "Content-Type: application/json" \
            -d '{"username":"admin","password":"admin123"}' > /dev/null
    done
    
    echo -e "\n📊 测试图书列表接口性能(10次请求):"
    time for i in {1..10}; do
        curl -s "${API_BASE}/book/available" > /dev/null
    done
}

# 主函数
main() {
    echo "开始API测试..."
    echo "================================"
    
    # 检查服务状态
    check_service
    
    # 登录获取token
    if login; then
        echo ""
        
        # 测试各个API
        test_user_api
        echo ""
        test_book_api
        echo ""
        test_borrow_api
        echo ""
        test_gateway
        echo ""
        
        # 询问是否进行性能测试
        read -p "是否进行性能测试? [y/N]: " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            performance_test
        fi
        
        echo ""
        success "所有API测试完成！"
        
        # 显示有用的curl命令
        echo ""
        info "常用测试命令:"
        echo "登录: curl -X POST ${API_BASE}/user/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
        echo "获取图书: curl ${API_BASE}/book/available"
        echo "健康检查: curl ${BASE_URL}/actuator/health"
        echo "网关路由: curl ${BASE_URL}/actuator/gateway/routes"
    else
        error "登录失败，无法继续测试"
        exit 1
    fi
}

# 运行主函数
main "$@"