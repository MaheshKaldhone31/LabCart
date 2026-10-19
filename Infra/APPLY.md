# Apply Runbook

## 0. Prerequisites

Configure AWS credentials with enough permissions to create the listed resources. Prefer IAM Identity Center/federated short-lived credentials rather than IAM users with long-lived keys.

## 1. Bootstrap state

```bash
cd Infra/bootstrap
cp terraform.tfvars.example terraform.tfvars
# Edit state_bucket_name to a globally unique value.
terraform init
terraform plan
terraform apply
```

The bootstrap stack intentionally uses local state because the state bucket does not exist yet.

## 2. Network

```bash
cd ../network
cp terraform.tfvars.example terraform.tfvars
terraform init \
  -backend-config="bucket=YOUR_STATE_BUCKET" \
  -backend-config="key=labcart/prod/network/terraform.tfstate" \
  -backend-config="region=ap-south-1" \
  -backend-config="use_lockfile=true"
terraform plan
terraform apply
```

## 3. ECR

```bash
cd ../ecr
cp terraform.tfvars.example terraform.tfvars
terraform init \
  -backend-config="bucket=YOUR_STATE_BUCKET" \
  -backend-config="key=labcart/prod/ecr/terraform.tfstate" \
  -backend-config="region=ap-south-1" \
  -backend-config="use_lockfile=true"
terraform plan
terraform apply
```

## 4. EKS

Create/use a dedicated IAM role for platform administrators and put its ARN in `terraform.tfvars`. For public API access, set `cluster_endpoint_public_access_cidrs` to your trusted office/VPN egress CIDRs. If you can use private connectivity, set public access to false.

```bash
cd ../eks
cp terraform.tfvars.example terraform.tfvars
terraform init \
  -backend-config="bucket=YOUR_STATE_BUCKET" \
  -backend-config="key=labcart/prod/eks/terraform.tfstate" \
  -backend-config="region=ap-south-1" \
  -backend-config="use_lockfile=true"
terraform plan
terraform apply
```

Then:

```bash
aws eks update-kubeconfig --region ap-south-1 --name labcart-prod
kubectl get nodes
```

## 5. Workload/platform layer

Install/configure the AWS Load Balancer Controller using EKS Pod Identity, then deploy the LabCart Kubernetes manifests. For production, replace the current Nginx/Kind ingress path with an AWS ALB ingress where appropriate. Keep PostgreSQL and Redis as separate managed data services (RDS/ElastiCache) rather than relying on single-replica in-cluster stateful workloads.

## Production checklist before real traffic

- Put Terraform state in a dedicated AWS account or at least a tightly controlled bucket.
- Use IAM Identity Center/federated roles and least-privilege EKS Access Entries.
- Prefer a private EKS API endpoint when your operators/CI have VPC connectivity.
- Use AWS Load Balancer Controller + ACM for HTTPS and Route 53 for DNS.
- Use RDS Multi-AZ for PostgreSQL and ElastiCache/managed Redis for Redis.
- Add AWS Backup where applicable.
- Add CloudTrail, GuardDuty, Security Hub and centralized logging according to your organization’s baseline.
- Add Kubernetes NetworkPolicies, Pod Security Standards, resource requests/limits, PDBs, HPA, topology spread constraints, and image signing/admission controls at the workload layer.
- Add CI/CD that builds immutable image tags and updates Kubernetes manifests through GitOps or a controlled deployment pipeline.
