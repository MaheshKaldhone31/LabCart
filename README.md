# LabCart

LabCart is a small full-stack e-commerce demo built for learning containerization, Docker Compose, and Kubernetes. The project includes a React frontend, an Express/TypeScript API, a PostgreSQL database, Redis, and a worker service.

## What this project includes

- Frontend: React + Vite + Tailwind CSS
- Backend API: Express + TypeScript
- Worker: TypeScript background worker
- Data layer: PostgreSQL and Redis
- Deployment files: Docker Compose and Kubernetes manifests

## Fork this repository

1. Fork this repository on GitHub.
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/labcart.git
cd labcart
```

3. Install dependencies:

```bash
npm install
```

## Run locally with Docker Compose

Start the full stack:

```bash
docker compose up --build
```

Access the services:

- Frontend: http://localhost:5173
- API health check: http://localhost:4000/health

Stop the stack:

```bash
docker compose down
```

## Run services locally without Docker Compose

If you want to run the supporting services with Docker and the app services directly on your machine:

```bash
docker compose -f compose.supporting.yml up -d postgres redis
npm run dev:api
npm run dev:worker
npm run dev:web
```

## Kubernetes deployment

This repository also contains Kubernetes manifests under the deploy/k8s folder.

### Prerequisites

- Docker
- kubectl
- A Kubernetes cluster such as kind, Minikube, or a cloud-based cluster

### Example with kind

```bash
kind create cluster --config deploy/k8s/overlays/kind/kind-config.yaml
kubectl apply -k deploy/k8s/overlays/dev
```

Check the deployed resources:

```bash
kubectl get pods,svc,ingress -n dev
```

## Project structure

- apps/api: Express API service
- apps/web: React frontend
- apps/worker: background worker service
- deploy/k8s: Kubernetes manifests and overlays
- docker-compose.yml: full app stack
- compose.supporting.yml: supporting services only

## Suggested learning flow

1. Run the app locally with Docker Compose.
2. Explore the API and frontend behavior.
3. Deploy the app to Kubernetes.
4. Improve the app in your own fork with observability, CI/CD, or security enhancements.

## Commit and push your changes

After making changes in your fork:

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```
