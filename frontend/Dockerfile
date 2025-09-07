FROM node:16-alpine AS build

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建的文件
COPY --from=build /app/build /usr/share/nginx/html

# 创建非root用户
RUN addgroup -g 1001 -S nginx && adduser -S nginx -G nginx

# 更改文件所有者
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chown -R nginx:nginx /usr/share/nginx/html

# 切换到非root用户
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]