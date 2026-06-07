# 📁 DocFlow — Intelligent Document Processing Pipeline

A full-stack file processing pipeline built with Spring Boot, React, and AWS.
Upload a CSV/PDF → automatically processed → results queryable via GraphQL.

![AWS](https://img.shields.io/badge/AWS-Cloud-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.14-green)
![React](https://img.shields.io/badge/React-Vite-blue)
![GraphQL](https://img.shields.io/badge/GraphQL-API-pink)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)

---

## 🏗️ Architecture

```
React (S3 Static Hosting)
      ↓ Apollo Client (GraphQL)
Spring Boot API (EC2 + Docker)
      ↓ JPA
PostgreSQL (AWS RDS)
      ↑
Lambda ← SQS ← S3 (file storage)
      ↓
SNS (email notifications)
```

---

## ✨ Features

- 📤 Upload CSV/PDF files directly to AWS S3
- ⚡ Automatic processing via AWS Lambda
- 📊 GraphQL API for querying file records
- 🔄 Real-time status updates (UPLOADED → PROCESSED)
- 📧 Email notifications via AWS SNS
- 🐳 Fully containerized with Docker
- ☁️ Deployed on AWS (EC2, RDS, S3, Lambda, SQS, SNS)

---

## 🛠️ Tech Stack

### Backend
- Java 21 + Spring Boot 3.5.14
- Spring GraphQL
- Spring Data JPA
- PostgreSQL
- Lombok
- Docker

### Frontend
- React (Vite)
- Apollo Client
- React Router

### AWS Services

| Service | Purpose |
|---------|---------|
| EC2 (t2.micro) | Hosts Spring Boot API |
| RDS PostgreSQL | Database |
| S3 | File storage + React hosting |
| Lambda (Python) | Auto-processes uploaded files |
| SQS | Message queue between S3 and Lambda |
| SNS | Email notifications |
| CloudWatch | Monitoring and alarms |
| IAM | Security and permissions |

---

## 🔄 How It Works

1. User selects file in React UI
2. React requests pre-signed URL from Spring Boot
3. File uploads **directly** to S3 (bypasses server)
4. S3 notifies SQS queue
5. Lambda reads from SQS → downloads file → counts records
6. Lambda calls Spring Boot GraphQL API to update status
7. Spring Boot updates RDS → status: PROCESSED
8. SNS sends email notification
9. React shows PROCESSED + record count

---

## 📐 GraphQL API

```graphql
type Query {
  getAllFiles: [FileRecord!]!
  getFile(id: ID!): FileRecord
  getFilesByStatus(status: FileStatus!): [FileRecord!]!
}

type Mutation {
  requestUpload(fileName: String!, fileType: String!): UploadRequest!
  updateFileStatus(id: ID!, status: FileStatus!): FileRecord
  updateFileByS3Key(s3Key: String!, recordCount: Int!): FileRecord
  deleteFile(id: ID!): Boolean
}
```

---

## 🚀 Local Development

### Prerequisites
- Java 21
- Maven
- Node.js 18+
- Docker Desktop
- AWS CLI

### Run Locally

```bash
# Backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Frontend
cd frontend
npm install
npm run dev
```

### Run with Docker

```bash
docker compose up --build
```

---

## ☁️ AWS Deployment

See [SETUP.md](SETUP.md) for complete AWS setup guide.

---

## 👨‍💻 Author

**Pranav Praveen**
Software Developer | Java · Spring Boot · React · AWS

[![GitHub](https://img.shields.io/badge/GitHub-GladiHimself-black?logo=github)](https://github.com/GladiHimself)