# LabCart

LabCart is a small full-stack e-commerce demo designed for hands-on Kubernetes and containerization practice. It includes a React frontend, an Express/TypeScript API, a PostgreSQL database, Redis, and a worker service that can be deployed with Docker Compose or Kubernetes.

## Why this repo exists

This repository is intended for learners who want to:

- practice building and running multi-service applications
- containerize services with Docker
- deploy workloads with Docker Compose
- explore Kubernetes resources such as Deployments, Services, Ingress, Secrets, and HPA
- fork the project and work from their own GitHub copy

## Fork this repository

1. Create a fork of this repository on GitHub.
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

This project includes a full Compose setup for local development and testing.

```bash
docker compose up --build
```

Once the services are running, use:

- Frontend: http://localhost:5173
- API health check: http://localhost:4000/health

To stop the stack:

```bash
docker compose down
```

## Run locally without Docker Compose

If you want to run the services directly on your machine:

```bash
docker compose -f compose.supporting.yml up -d postgres redis
npm run dev:api
npm run dev:worker
npm run dev:web
```

## Kubernetes deployment

This repository also includes Kubernetes manifests under the deploy/k8s folder.

### Prerequisites

- Docker
- kubectl
- a Kubernetes cluster such as kind, Minikube, or a cloud cluster

### Example with kind

```bash
kind create cluster --config deploy/k8s/overlays/kind/kind-config.yaml
kubectl apply -k deploy/k8s/overlays/dev
```

Check the resources:

```bash
kubectl get pods,svc,ingress -n dev
```

If you need to test locally without ingress, use port-forwarding:

```bash
kubectl port-forward svc/web 8080:80 -n dev
kubectl port-forward svc/api 4000:4000 -n dev
```

## Project structure

- apps/api: Express API and database access
- apps/web: Vite + React frontend
- apps/worker: background worker service
- deploy/k8s: Kubernetes manifests and overlays
- docker-compose.yml: full local stack for the app
- compose.supporting.yml: supporting services only

## Suggested learning flow

1. Run the app locally with Docker Compose.
2. Explore the API and frontend behavior.
3. Deploy the app to Kubernetes.
4. Add improvements, observability, or CI/CD steps in your own fork.

## Commit and push your changes

After making changes in your fork:

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```
