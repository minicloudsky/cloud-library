#!/bin/bash

# 部署图书管理系统到K8s集群

set -e

echo "开始部署图书管理系统到K8s集群..."

# 创建命名空间
echo "创建命名空间..."
kubectl apply -f k8s/namespace/namespace.yaml

# 等待命名空间创建完成
sleep 2

# 部署基础设施
echo "部署MySQL..."
kubectl apply -f k8s/infrastructure/mysql.yaml

echo "部署Redis..."
kubectl apply -f k8s/infrastructure/redis.yaml

# 等待基础设施就绪
echo "等待MySQL启动..."
kubectl wait --for=condition=ready pod -l app=mysql -n library-system --timeout=300s

echo "等待Redis启动..."
kubectl wait --for=condition=ready pod -l app=redis -n library-system --timeout=300s

# 构建Docker镜像
echo "构建后端Docker镜像..."
docker build -t library-backend:latest ./backend

echo "构建前端Docker镜像..."
docker build -t library-frontend:latest ./frontend

# 部署应用服务
echo "部署后端服务..."
kubectl apply -f k8s/services/backend.yaml

echo "部署前端服务..."
kubectl apply -f k8s/services/frontend.yaml

# 等待服务就绪
echo "等待后端服务启动..."
kubectl wait --for=condition=ready pod -l app=library-backend -n library-system --timeout=300s

echo "等待前端服务启动..."
kubectl wait --for=condition=ready pod -l app=library-frontend -n library-system --timeout=300s

echo "部署完成!"
echo ""
echo "服务访问信息:"
echo "前端: http://library.local (需要配置hosts)"
echo "后端API: http://api.library.local (需要配置hosts)"
echo ""
echo "配置hosts文件 (替换<INGRESS_IP>为实际的Ingress IP):"
echo "<INGRESS_IP> library.local"
echo "<INGRESS_IP> api.library.local"
echo ""
echo "查看服务状态:"
echo "kubectl get pods -n library-system"
echo "kubectl get svc -n library-system"
echo "kubectl get ingress -n library-system"