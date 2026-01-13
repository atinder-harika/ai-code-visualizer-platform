# Implementation Roadmap

> **Step-by-step guide to understanding and extending the AI Code Visualizer Platform**

This document provides a structured learning path for developers looking to understand the platform architecture, implement new features, or deploy to production.

---

## Phase 1: Understanding the Foundation (Week 1)

### Goals
- Understand microservices architecture principles
- Grasp service communication patterns
- Set up local development environment

### Prerequisites
- Docker & Docker Compose installed
- Basic knowledge of REST APIs
- Familiarity with React, Python, or Java

### Learning Objectives

#### 1.1 Microservices Fundamentals
**Read:**
- [Microservices Architecture](https://microservices.io/patterns/microservices.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)

**Exercises:**
1. Draw the service dependency graph for this platform
2. Identify what happens if one service fails
3. List advantages/disadvantages vs. monolithic architecture

#### 1.2 Docker & Container Orchestration
**Study:** `docker-compose.yml`

**Key Concepts:**
- Service definitions and dependencies (`depends_on`)
- Network isolation (`platform-network`)
- Volume persistence (`postgres-data`)
- Health checks and restart policies

**Exercise:**
```bash
# Start services one by one and observe dependencies
docker-compose up postgres
docker-compose up gemini-service
docker-compose up analyzer-service
docker-compose up api-gateway
docker-compose up frontend

# Check service health
curl http://localhost:8000/api/services/status
```

#### 1.3 API Gateway Pattern
**Study:** `backend/api-gateway/main.py`

**Key Concepts:**
- Request orchestration with `asyncio.gather()`
- Parallel service calls
- Response aggregation
- Error handling across services

**Exercise:**
1. Modify the gateway to call services sequentially instead of parallel
2. Measure the performance difference
3. Implement timeout handling for slow services

---

## Phase 2: Service Integration (Week 2-3)

### Goals
- Understand how services communicate
- Implement new endpoints
- Handle failures gracefully

### 2.1 Frontend-Gateway Integration
**Study:** `frontend/src/App.tsx`

**Key Concepts:**
- Axios for HTTP requests
- State management with React hooks
- Error handling and loading states
- TypeScript interfaces for API responses

**Exercise:**
Implement a new feature: "Repository History"
```typescript
// Add to App.tsx
const [history, setHistory] = useState<string[]>([]);

const saveToHistory = (url: string) => {
  setHistory(prev => [url, ...prev].slice(0, 5));
  localStorage.setItem('repoHistory', JSON.stringify(history));
};
```

### 2.2 Gateway-Service Communication
**Study:** `backend/api-gateway/main.py` → Service calls

**Key Concepts:**
- `httpx.AsyncClient` for async HTTP
- Service discovery (environment variables)
- Retry logic and circuit breakers

**Exercise:**
Implement retry logic:
```python
from tenacity import retry, stop_after_attempt, wait_fixed

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
async def call_with_retry(url, data):
    async with httpx.AsyncClient() as client:
        return await client.post(url, json=data)
```

### 2.3 Database Integration
**Create:** `backend/init-db.sql`

**Schema:**
```sql
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_url TEXT NOT NULL,
    branch VARCHAR(100) DEFAULT 'main',
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES analyses(id),
    ai_documentation TEXT,
    complexity_metrics JSONB,
    patterns TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_created ON analyses(created_at DESC);
```

**Exercise:**
Modify `api-gateway/main.py` to store results:
```python
import asyncpg

async def store_analysis(result: AnalysisResponse):
    conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
    try:
        await conn.execute("""
            INSERT INTO analyses (repository_url, branch, status)
            VALUES ($1, $2, $3)
        """, result.repositoryUrl, result.branch, result.status)
    finally:
        await conn.close()
```

---

## Phase 3: Advanced Features (Week 4-5)

### Goals
- Implement asynchronous processing
- Add real-time updates
- Deploy to production

### 3.1 Asynchronous Job Processing
**New Dependency:** Redis for job queue

**Add to `docker-compose.yml`:**
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  networks:
    - platform-network
```

**Implementation:**
```python
# backend/api-gateway/tasks.py
from rq import Queue
from redis import Redis

redis_conn = Redis(host='redis', port=6379)
queue = Queue(connection=redis_conn)

def analyze_repository_async(repo_url, branch):
    # Long-running task
    pass

# In main.py
@app.post("/api/analyze/async")
async def analyze_async(request: AnalysisRequest):
    job = queue.enqueue(analyze_repository_async, 
                        request.repositoryUrl, 
                        request.branch)
    return {"job_id": job.id, "status": "queued"}
```

**Exercise:**
1. Implement job status endpoint: `GET /api/jobs/{job_id}`
2. Add worker service to `docker-compose.yml`
3. Test with multiple concurrent requests

### 3.2 Real-Time Updates (WebSocket)
**Install:** `pip install websockets`

**Backend:**
```python
from fastapi import WebSocket

@app.websocket("/ws/analysis/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await websocket.accept()
    while True:
        status = await check_job_status(job_id)
        await websocket.send_json({"status": status})
        await asyncio.sleep(2)
        if status == "completed":
            break
```

**Frontend:**
```typescript
const ws = new WebSocket(`ws://localhost:8000/ws/analysis/${jobId}`);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  setProgress(data.status);
};
```

### 3.3 Caching Layer
**Add to `docker-compose.yml`:**
```yaml
redis-cache:
  image: redis:7-alpine
  command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
```

**Implementation:**
```python
from redis import Redis
cache = Redis(host='redis-cache', port=6379)

async def get_cached_analysis(repo_url: str):
    cached = cache.get(f"analysis:{repo_url}")
    if cached:
        return json.loads(cached)
    return None

async def cache_analysis(repo_url: str, result: dict):
    cache.setex(f"analysis:{repo_url}", 3600, json.dumps(result))
```

---

## Phase 4: Production Deployment (Week 6)

### Goals
- Deploy to AWS using Terraform
- Configure CI/CD pipelines
- Set up monitoring

### 4.1 Infrastructure Provisioning
**Use:** `terraform-aws-iac-provisioner` repository

**Steps:**
```bash
cd ../terraform-aws-iac-provisioner/terraform

# Initialize Terraform
terraform init

# Create deployment
terraform apply -var-file="environments/prod/terraform.tfvars"
```

**Outputs:**
- VPC ID
- ECS Cluster ARN
- ALB DNS name
- RDS endpoint

### 4.2 Container Registry (ECR)
**Push Images:**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t ai-visualizer-frontend ./frontend
docker tag ai-visualizer-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
```

### 4.3 ECS Task Definitions
**Create:** `aws/ecs-task-definitions/gateway.json`

```json
{
  "family": "api-gateway",
  "containerDefinitions": [
    {
      "name": "gateway",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/gateway:latest",
      "portMappings": [{"containerPort": 8000}],
      "environment": [
        {"name": "GEMINI_SERVICE_URL", "value": "http://gemini.local:8000"},
        {"name": "ANALYZER_SERVICE_URL", "value": "http://analyzer.local:8080"}
      ],
      "secrets": [
        {"name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:..."}
      ]
    }
  ]
}
```

### 4.4 CI/CD Pipeline
**Create:** `.github/workflows/platform-ci.yml`

```yaml
name: Platform CI/CD

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Frontend
        run: |
          cd frontend
          docker build -t frontend .
      
      - name: Build Gateway
        run: |
          cd backend/api-gateway
          docker build -t gateway .
      
      - name: Push to ECR
        run: |
          # Push images...
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster platform \
            --service frontend --force-new-deployment
```

---

## Phase 5: Monitoring & Optimization (Ongoing)

### 5.1 Observability Stack
**Add to infrastructure:**
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Jaeger**: Distributed tracing

**Key Metrics:**
- Request latency (p50, p95, p99)
- Error rates by service
- Service availability (uptime %)
- Database query performance

### 5.2 Performance Optimization
**Areas to investigate:**
1. **Database**: Add indexes, connection pooling
2. **Caching**: Implement Redis for hot paths
3. **API Gateway**: Batch requests, compression
4. **Frontend**: Code splitting, lazy loading

### 5.3 Load Testing
**Use:** `locust` for load testing

```python
# locustfile.py
from locust import HttpUser, task

class PlatformUser(HttpUser):
    @task
    def analyze_repository(self):
        self.client.post("/api/analyze", json={
            "repositoryUrl": "https://github.com/test/repo",
            "branch": "main"
        })
```

**Run:**
```bash
locust -f locustfile.py --host=http://localhost:8000
```

**Target Performance:**
- 100 RPS sustained
- <500ms p95 latency
- 99.9% availability

---

## Learning Resources

### Books
- *Building Microservices* by Sam Newman
- *Designing Data-Intensive Applications* by Martin Kleppmann

### Online Courses
- [AWS Solutions Architect](https://aws.amazon.com/certification/)
- [Docker Mastery](https://www.udemy.com/course/docker-mastery/)

### Documentation
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [React Official Docs](https://react.dev/)
- [Spring Boot Guides](https://spring.io/guides)

---

## Troubleshooting Guide

### Common Issues

**Services can't connect:**
```bash
# Check network
docker network inspect ai-code-visualizer-platform_platform-network

# Check service logs
docker-compose logs gemini-service
```

**Database connection fails:**
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Test connection
docker exec -it <postgres-container> psql -U platform_user platform_db
```

**Frontend can't reach gateway:**
- Check CORS settings in `api-gateway/main.py`
- Verify `VITE_API_GATEWAY_URL` environment variable

---

## Next Steps

Once you've completed this roadmap:
1. **Contribute**: Add new features (authentication, file uploads, etc.)
2. **Optimize**: Profile and improve performance bottlenecks
3. **Scale**: Deploy multi-region for global availability
4. **Share**: Write blog posts about your learnings

**Questions?** Open an issue or reach out to the maintainer.

---

**Good luck on your learning journey! 🚀**
