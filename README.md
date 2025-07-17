# Gather

![Deployment](https://img.shields.io/badge/deployment-gather.yagyagoel.dev-blue)  
![License](https://img.shields.io/badge/license-MIT-green)

**Gather** is a 3D metaverse web application enabling real‑time, multi‑user interaction and rich spatial experiences. Built on a monorepo architecture, Gather demonstrates end‑to‑end backend engineering skills—from API design and WebSocket server implementation to containerized deployment and CI/CD automation.

---
![image](https://github.com/user-attachments/assets/8c1b60ec-c218-4d77-86e9-6ef6236efaf7)

## 🚀 Key Features

- **Real‑Time Communication**:  
  - WebSocket server implemented with **Socket.io** for low‑latency, bidirectional messaging and synchronized 3D state updates.  
  - Scalable pub/sub pattern powered by **Redis** for horizontal WebSocket scaling.

- **RESTful API Layer**:  
  - **Express.js** + **TypeScript** for type-safe, maintainable route definitions.  
  - CRUD endpoints for user sessions, avatar profiles, and persistent world data.  
  - Input validation using **Zod**.

- **Data Persistence & Caching**:  
  - **MongoDB** for NoSQL document storage of user profiles, room metadata, and chat logs.  
  - **Redis** session store and in‑memory caching for sub‑millisecond read/write.

- **Microservices & Monorepo**:  
  - Managed with **Turborepo** and **pnpm workspaces** to enforce clear separation of `apps/server`, `apps/client`, and shared `packages/*`.  
  - Dockerized microservices with **Docker Compose** for local development and production parity.

- **Cloud Deployment & Infrastructure**:  
  - **AWS EC2** hosting, **S3** asset storage, and **Nginx** reverse proxy with SSL termination.  
  - Infrastructure-as-code snippets for automated provisioning (CloudFormation / Terraform).

- **CI/CD & Quality Assurance**:  
  - **GitHub Actions** pipeline for linting, type‑checking, testing (Jest + Supertest), and Docker image builds.  
  - Code coverage reports and pull‑request gating to maintain high reliability.

---

## 📦 Tech Stack

| Layer            | Technologies                          |
| ---------------- | ------------------------------------- |
| Runtime & APIs   | Node.js · TypeScript · Express.js     |
| Real‑Time Sync   | WebSockets · Redis Pub/Sub             |
| Database         | MongoDB · Mongoose ODM                |
| Caching & Store  | Redis Session Store                   |
| Monorepo         | Turborepo · pnpm                      |
| Containerization | Docker · Docker Compose               |
| Cloud & Infra    | AWS EC2 · S3 · Nginx · SSL/TLS        |
| CI/CD            | GitHub Actions · Jest · Supertest     |
| Lint & Format    | ESLint · Prettier                     |
| Testing          | Jest · Supertest · Zod (validation)   |

---

## 💻 Installation & Local Development

1. **Clone & Install**

   ```bash
   git clone https://github.com/yagyagoel1/gather.git
   cd gather
   pnpm install
