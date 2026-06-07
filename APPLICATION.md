# 🔧 DocFlow — Backend Configuration Guide

---

## 📁 File Structure

```
backend/src/main/resources/
├── application.properties        ← safe to commit ✅
├── application-local.properties  ← NEVER commit ❌ (gitignored)
└── graphql/
    └── schema.graphqls
```

---

## application.properties (safe to commit ✅)

```properties
# App name
spring.application.name=docflow-backend

# Server port
server.port=8081

# JPA Settings (no credentials here)
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# GraphQL settings
spring.graphql.graphiql.enabled=true

# CORS
spring.graphql.cors.allowed-origins=*
spring.graphql.cors.allowed-methods=GET,POST
spring.graphql.cors.allowed-headers=*

spring.jpa.open-in-view=false

# S3 Config (actual values in application-local.properties)
aws.s3.bucket-name=
aws.s3.region=ap-south-1
```

---

## application-local.properties (NEVER commit ❌)

```properties
# RDS endpoint → AWS Console → RDS → docflow-db → Connectivity & security tab
spring.datasource.url=jdbc:postgresql://YOUR_RDS_ENDPOINT:5432/docflowdb
spring.datasource.driver-class-name=org.postgresql.Driver

# RDS credentials → set during RDS creation
spring.datasource.username=docflow_user
spring.datasource.password=docflow123

# S3 bucket name
aws.s3.bucket-name=docflow-files-pranav-2026

# IAM Access Key → AWS Console → IAM → Users → docflow-dev
#               → Security credentials tab → Access keys → Create access key
aws.access-key=YOUR_IAM_ACCESS_KEY

# IAM Secret Key → downloaded when creating access key (only shown once!)
aws.secret-key=YOUR_IAM_SECRET_KEY
```

---

## frontend/.env (NEVER commit ❌)

```
# EC2 IP → AWS Console → EC2 → Instances → Public IPv4 address
VITE_API_URL=http://YOUR_EC2_IP:8081/graphql
```

---

## .gitignore Must Include

```gitignore
# Credentials
backend/src/main/resources/application-local.properties

# Docker artifacts
*.tar.gz
*.tar

# Frontend env
frontend/.env
frontend/.env.*
```

---

## Run Commands

```bash
# Run locally with credentials
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Run with Docker on EC2
docker run -d \
  --name docflow-backend \
  -p 8081:8081 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://RDS_ENDPOINT:5432/docflowdb \
  -e SPRING_DATASOURCE_USERNAME=docflow_user \
  -e SPRING_DATASOURCE_PASSWORD=docflow123 \
  -e SPRING_PROFILES_ACTIVE=local \
  docflow-backend
```

---

## How Profiles Work

```
application.properties        → always loaded (shared config)
application-local.properties  → loaded only when profile=local
                                contains credentials
                                gitignored → never pushed to GitHub
```