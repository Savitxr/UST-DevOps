FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app


COPY pom.xml .
COPY src ./src


RUN mvn clean package -DskipTests


FROM eclipse-temurin:17-jre

ENV DEBIAN_FRONTEND=noninteractive


RUN apt update -y && apt install -y mysql-server

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar


COPY init.sql /init.sql
COPY start.sh /start.sh

RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
