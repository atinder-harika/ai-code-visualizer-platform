🚀 AI Code Visualizer Platform (M1-M6 Integration)
The top-level orchestration and system architecture repository for the full-stack, microservice-based application. Demonstrates end-to-end delivery of a Generative AI product.

<div align="center">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Status-In%2520Development-blue" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Focus-System%2520Design%2520%257C%2520Microservices-red" />
</div>

💡 Project Overview
This repository aggregates all modules (M1-M6) of the AI-Powered Code Visualization Platform. The system's purpose is to ingest raw code, analyze its structure, generate a pedagogical narrative using the Gemini API, and visualize the execution flow in a web/mobile studio.

This project validates proficiency in system architecture, full-stack integration, event-driven design (Kafka), and cloud deployment (AWS/Terraform).

⚙️ Core Technology Stack
Category

Technology

Rationale

Backend/Core

Java (Spring Boot), Python (FastAPI)

Used for high-performance analysis (Java) and serverless AI orchestration (Python).

Frontend/UI

Angular, React (M1 Dashboard), Ionic/Capacitor

Selected for full-stack control, mobile-readiness, and efficient, responsive data visualization.

DevOps/Cloud

Terraform, AWS EKS/RDS, Docker, GitHub Actions

Used for automated, secure infrastructure provisioning (IaC) and enterprise-grade CI/CD pipelines.

Data/Messaging

PostgreSQL, Kafka/Kinesis

Selected for durable storage and high-throughput, asynchronous communication between microservices.

🔑 Key Technical Deliverables
Orchestrated a four-tier microservice architecture using API Gateway patterns and Kafka streaming for real-time data flow between the Java Analyzer, Python AI service, and front-end APIs.

Implemented comprehensive Infrastructure as Code (IaC) using Terraform to provision the entire AWS environment, ensuring reliable, reproducible deployments.

Designed a monitoring strategy (M1 Dashboard) to track the health, latency, and throughput of all individual microservices and the core Kafka stream.

📌 Roadmap Status (Self-Tracked)
Milestone

Status

Details

M1: React Health Dashboard

⚪ To Do

Initial monitoring UI framework setup.

M2: Terraform IaC Provisioner

⚪ To Do

AWS VPC and base RDS/EKS infrastructure definition underway.

M3: CI/CD Platform Integration

⚪ To Do

Template CI/CD pipeline defined and ready for service integration.

M4: Java Concurrent Analyzer

⚪ To Do

Focusing on core Java concurrency logic.

M5: Generative AI Service

⚪ To Do

Defining the Gemini API orchestration logic via Python.

M6: Final Studio UI

⚪ To Do

Angular UI/UX design started.
