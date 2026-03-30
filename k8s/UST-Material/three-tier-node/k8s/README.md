# AWS Kubernetes Deployment Guide (EKS / Master-Worker)

This directory contains the production-ready Kubernetes manifests for deploying your 3-tier application to an AWS cluster.

## Key Changes for AWS
- **Frontend Service**: Changed from `NodePort` to `LoadBalancer`. AWS will automatically provision an Elastic Load Balancer (ELB) to give your frontend a public IP/URL.
- **MySQL & Redis**: Added `PersistentVolumeClaim`s (PVC). In a multi-node worker cluster, Pods can move between nodes. PVCs ensure your database storage (`/var/lib/mysql`) and Redis cache (`/data`) are stored on AWS EBS volumes so data isn't lost if a worker node crashes.
- **Backend High Availability**: Scaled to 2 replicas so requests are load-balanced across multiple worker nodes.

---

## Prerequisites
Before you apply these manifests, you need to build your Docker images and push them to Docker Hub.

### 1. Build and Push Backend Image
From your project root (where `backend` folder is):
```bash
cd backend
docker build -t <your-dockerhub-username>/student-backend:latest .
docker push <your-dockerhub-username>/student-backend:latest
```

### 2. Build and Push Frontend Image
From your project root (where `frontend` folder is):
```bash
cd frontend
docker build -t <your-dockerhub-username>/student-frontend:latest .
docker push <your-dockerhub-username>/student-frontend:latest
```

## Update Manifests
Once pushed, open `k8s/backend.yaml` and `k8s/frontend.yaml` and replace placeholders with your actual image names:
- In `backend.yaml`, replace `image: backend-image:latest` with `image: <your-dockerhub-username>/student-backend:latest`
- In `frontend.yaml`, replace `image: frontend-image:latest` with `image: <your-dockerhub-username>/student-frontend:latest`

## Deploy to AWS Kubernetes
Run the following commands to create the resources in your cluster:
```bash
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/redis.yaml

# Wait for PVCs to bind and DBs to start...
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

## Accessing the App on AWS
Because `frontend` is using `NodePort` on port `30080`, you can access your application by entering the Public IP of any of your AWS worker nodes followed by `:30080` in your browser.

Example: `http://<worker-node-public-ip>:30080`

*Note: Ensure your AWS Security Group attached to your worker nodes allows inbound traffic on port `30080`!*
