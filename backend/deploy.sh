#!/bin/bash

# 图书管理系统部署脚本

set -e

echo "开始部署图书管理系统..."

# 创建命名空间
echo "创建命名空间..."
kubectl apply -f k8s/namespace.yaml

# 部署基础设施
echo "部署MySQL..."
kubectl apply -f k8s/infrastructure/mysql.yaml

echo "部署Redis..."
kubectl apply -f k8s/infrastructure/redis.yaml

echo "部署Nacos..."
kubectl apply -f k8s/infrastructure/nacos.yaml

# 等待基础设施就绪
echo "等待基础设施就绪..."
kubectl wait --for=condition=ready pod -l app=mysql -n library-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n library-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=nacos -n library-system --timeout=300s

# 构建镜像（需要Docker环境）
echo "构建服务镜像..."
if command -v docker &> /dev/null; then
    # 用户服务
    cd user-service
    docker build -t library/user-service:latest .
    cd ..
    
    # 图书服务
    cd book-service
    docker build -t library/book-service:latest .
    cd ..
    
    # 借阅服务
    cd borrow-service
    docker build -t library/borrow-service:latest .
    cd ..
    
    # 网关服务
    cd gateway-service
    docker build -t library/gateway-service:latest .
    cd ..
else
    echo "警告: Docker未安装，请手动构建镜像"
fi

# 部署微服务
echo "部署用户服务..."
kubectl apply -f k8s/services/user-service.yaml

echo "部署图书服务..."
kubectl apply -f k8s/services/book-service.yaml

echo "部署借阅服务..."
kubectl apply -f k8s/services/borrow-service.yaml

echo "部署网关服务..."
kubectl apply -f k8s/services/gateway-service.yaml

# 等待服务就绪
echo "等待服务就绪..."
kubectl wait --for=condition=ready pod -l app=user-service -n library-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=book-service -n library-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=borrow-service -n library-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=gateway-service -n library-system --timeout=300s

echo "部署完成！"
echo "访问地址: http://$(kubectl get svc gateway-service -n library-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):8080"
echo "管理员账号: admin"
echo "管理员密码: admin123"