FROM maven:3.8.6-openjdk-11 AS build

WORKDIR /app

# 复制父项目pom.xml
COPY pom.xml .
COPY library-service/pom.xml ./library-service/

# 下载依赖
RUN mvn dependency:go-offline -B

# 复制源代码
COPY library-service/src ./library-service/src

# 构建应用
RUN mvn clean package -DskipTests -f library-service/pom.xml

FROM openjdk:11-jre-slim

WORKDIR /app

# 安装curl用于健康检查
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 复制jar文件
COPY --from=build /app/library-service/target/*.jar app.jar

# 更改文件所有者
RUN chown appuser:appuser app.jar

# 切换到非root用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080 20880

ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "-Dspring.profiles.active=docker", "app.jar"]