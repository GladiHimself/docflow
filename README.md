# 📁 DocFlow — Intelligent Document Processing Pipeline

A full-stack file processing pipeline built with Spring Boot, React, and AWS.
Upload a CSV, PDF or Image → automatically processed → results queryable via GraphQL.

![AWS](https://img.shields.io/badge/AWS-Cloud-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.14-green)
![React](https://img.shields.io/badge/React-Vite-blue)
![GraphQL](https://img.shields.io/badge/GraphQL-API-pink)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![Python](https://img.shields.io/badge/Lambda-Python%203.12-yellow)

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

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND                           │
│                   (S3 Static Hosting)                           │
│                                                                 │
│  HomePage              FileDetailPage                           │
│  ┌──────────────┐      ┌──────────────────────────┐            │
│  │ FileUpload   │      │ File details (read-only)  │            │
│  │ - Pick file  │      │ - Status badge            │            │
│  │ - Auto type  │      │ - Record count            │            │
│  │ - Upload btn │      │ - Download button         │            │
│  └──────────────┘      │ - Delete button           │            │
│  ┌──────────────┐      └──────────────────────────┘            │
│  │ FileList     │                                               │
│  │ - All files  │                                               │
│  │ - Status     │                                               │
│  │ - Click →    │                                               │
│  │  detail page │                                               │
│  └──────────────┘                                               │
└────────────────┬────────────────────────────────────────────────┘
                 │ Apollo Client
                 │ GraphQL mutations/queries
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SPRING BOOT API (EC2 + Docker)                │
│                                                                 │
│  GraphQL Controller                                             │
│  ┌──────────────────────────────────────────────┐              │
│  │ requestUpload()      → generates S3 URL      │              │
│  │ getAllFiles()         → returns file list     │              │
│  │ getFile(id)          → returns single file   │              │
│  │ updateFileByS3Key()  → Lambda calls this     │              │
│  │ generateDownloadUrl()→ pre-signed GET URL    │              │
│  │ deleteFile(id)       → deletes from DB       │              │
│  └──────────────────────────────────────────────┘              │
│           ↓ Service Layer ↓                                     │
│  ┌──────────────┐    ┌──────────────────────────┐              │
│  │ S3Service    │    │ FileRecordService         │              │
│  │ - Upload URL │    │ - Business logic          │              │
│  │ - Download   │    │ - DB operations           │              │
│  │   URL        │    │                           │              │
│  └──────────────┘    └──────────────────────────┘              │
│           ↓ Repository Layer ↓                                  │
│  ┌──────────────────────────────────────────────┐              │
│  │ FileRecordRepository (Spring Data JPA)        │              │
│  │ findAll() / findById() / findByS3Key()        │              │
│  └──────────────────────────────────────────────┘              │
└──────────────────┬──────────────────┬──────────────────────────┘
                   │ JPA              │ AWS SDK
                   ↓                  ↓
┌──────────────┐   │   ┌──────────────────────────────────────┐
│  AWS RDS     │←──┘   │  AWS S3 (docflow-files-pranav-2026)  │
│  PostgreSQL  │        │  - Stores uploaded files             │
│              │        │  - Pre-signed URLs for upload        │
│  file_records│        │  - Pre-signed URLs for download      │
│  table       │        │  - Triggers SQS on PUT               │
└──────────────┘        └──────────────────┬───────────────────┘
                                           │ S3 Event Notification
                                           ↓
                        ┌──────────────────────────────────────┐
                        │  AWS SQS (docflow-file-queue)        │
                        │  - Buffers S3 upload events          │
                        │  - Prevents Lambda overload          │
                        │  - Retries on failure                │
                        └──────────────────┬───────────────────┘
                                           │ SQS Trigger
                                           ↓
                        ┌──────────────────────────────────────┐
                        │  AWS Lambda (Python 3.12)            │
                        │                                      │
                        │  1. Read file from S3                │
                        │  2. Detect file type:                │
                        │     CSV   → count rows               │
                        │     PDF   → measure size (KB)        │
                        │     IMAGE → measure size (KB)        │
                        │  3. Call Spring Boot GraphQL API     │
                        │     → updateFileByS3Key()            │
                        │     → status: PROCESSED              │
                        │  4. Publish to SNS                   │
                        └──────────────────┬───────────────────┘
                                           │ SNS Publish
                                           ↓
                        ┌──────────────────────────────────────┐
                        │  AWS SNS (docflow-notifications)     │
                        │  - Sends email notification          │
                        │  - "File Processed Successfully!"    │
                        └──────────────────────────────────────┘
```

---

## ✨ Features

- 📤 Upload CSV, PDF and Image files directly to AWS S3
- 🔍 Auto file type detection — no manual selection needed
- ⚡ Automatic processing via AWS Lambda
- 📊 GraphQL API for querying file records
- 🔄 Real-time status tracking (UPLOADED → PROCESSED)
- ⬇️ Secure file download via pre-signed S3 URLs
- 📧 Email notifications via AWS SNS
- 🐳 Fully containerized with Docker
- ☁️ Deployed on AWS (EC2, RDS, S3, Lambda, SQS, SNS, CloudWatch)
- 📱 Responsive UI with modern design

---

## 🛠️ Tech Stack

### Backend
- Java 21 + Spring Boot 3.5.14
- Spring GraphQL
- Spring Data JPA
- PostgreSQL
- Lombok
- Docker
- AWS SDK v2

### Frontend
- React (Vite)
- Apollo Client
- React Router
- Plus Jakarta Sans font

### AWS Services

| Service | Purpose |
|---------|---------|
| EC2 (t2.micro) | Hosts Spring Boot API in Docker |
| RDS PostgreSQL | Stores file metadata |
| S3 (files) | Stores uploaded files |
| S3 (frontend) | Hosts React app (static hosting) |
| Lambda (Python 3.12) | Auto-processes files on upload |
| SQS | Message queue between S3 and Lambda |
| SNS | Email notifications on processing |
| CloudWatch | Logs, monitoring and alarms |
| IAM | Roles and permissions |

---

## 🔄 How It Works

### Upload Flow
1. User selects file → file type auto-detected (CSV/PDF/IMAGE)
2. React calls `requestUpload` GraphQL mutation
3. Spring Boot generates pre-signed S3 URL + creates DB record
4. React uploads file **directly** to S3 (never touches server)
5. S3 sends event to SQS queue

### Processing Flow
6. Lambda reads message from SQS
7. Lambda downloads file from S3
8. Lambda processes file (count rows for CSV, size for PDF/IMAGE)
9. Lambda calls Spring Boot `updateFileByS3Key` mutation
10. Spring Boot updates RDS → status: PROCESSED
11. SNS sends email notification

### Retrieval Flow
12. React queries `getAllFiles` → shows file list with status
13. User clicks file → `getFile` query → shows details
14. User clicks Download → `generateDownloadUrl` → pre-signed GET URL → file downloads

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
  updateFileByS3Key(s3Key: String!, recordCount: Int!): FileRecord
  generateDownloadUrl(s3Key: String!): String!
  deleteFile(id: ID!): Boolean
}

enum FileStatus {
  UPLOADED
  PROCESSING
  PROCESSED
  FAILED
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
See [APPLICATION.md](APPLICATION.md) for backend configuration.

---

## 👨‍💻 Author

**Pranav Praveen**
Software Developer | Java · Spring Boot · React · AWS

[![GitHub](https://img.shields.io/badge/GitHub-GladiHimself-black?logo=github)](https://github.com/GladiHimself)