# LabCart — Production EKS Terraform

This Terraform layout separates AWS infrastructure into independent states so foundational resources are not coupled to EKS lifecycle changes.

## Layout

```text
Infra/
├── bootstrap/   # Terraform state S3 bucket; apply once, local state first
├── network/     # Production VPC, 3 AZs, public/private/intra subnets, NAT
├── ecr/         # Private ECR repositories for api/web/worker images
└── eks/         # EKS control plane, managed node groups, KMS, add-ons, access entries
```

## Design choices

- AWS provider pinned to `6.62.0`.
- EKS module pinned to `21.26.0`; VPC module pinned to `6.7.3`.
- Kubernetes `1.37`, the current EKS standard-support release at the time this configuration was created.
- EKS API authentication uses **Access Entries** (`authentication_mode = "API"`); no `aws-auth` ConfigMap management.
- Secrets are encrypted with a customer-managed KMS key.
- Control-plane `audit`, `api`, and `authenticator` logs are enabled and retained for 90 days.
- EKS managed add-ons include VPC CNI, CoreDNS, kube-proxy, and EBS CSI.
- Worker nodes are EKS Managed Node Groups in private subnets, using AL2023 and IMDSv2.
- No SSH access is enabled on nodes.
- Three NAT gateways are used for AZ-level egress resilience.
- ECR repositories use immutable tags, scan-on-push, AES-256 encryption, and lifecycle cleanup.
- Terraform state uses S3 versioning, encryption, public-access blocking, and native S3 lock files (`use_lockfile = true`).

## Important

This is infrastructure code, not application deployment code. Your existing `deploy/k8s` manifests remain separate. For production EKS, expose the web application through AWS Load Balancer Controller/ALB rather than `kubectl port-forward`.

The EKS stack intentionally does **not** create an RDS database or ElastiCache Redis instance yet. Those should be separate data-layer stacks with their own state and lifecycle. The LabCart Kubernetes manifests can then be changed to use those endpoints/secrets.

## Apply order

1. `bootstrap/`
2. `network/`
3. `ecr/`
4. `eks/`
5. Kubernetes workload/platform layer (AWS Load Balancer Controller, namespaces, secrets, deployments, ingress, etc.)

Each stack is independent. Do not run `terraform apply` from `Infra/` itself because there are no root `.tf` files there.
