FROM openjdk:17-jdk-slim

# 设置工作目录
WORKDIR /app

# 复制maven依赖描述文件
COPY pom.xml .
COPY ../pom.xml ../pom.xml

# 复制源代码
COPY src src
COPY ../library-common ../library-common

# 安装maven
RUN apt-get update && apt-get install -y maven

# 编译项目
RUN mvn clean package -DskipTests -f ../pom.xml
RUN cp target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]