
provider "aws" {
  region = var.aws_region
}

# Read the newly created EKS cluster
data "aws_eks_cluster" "this" {
  name = var.cluster_name
}

data "aws_eks_cluster_auth" "this" {
  name = var.cluster_name
}

# Create an IAM OIDC provider for the current EKS cluster
resource "aws_iam_openid_connect_provider" "eks" {
  url            = data.aws_eks_cluster.this.identity[0].oidc[0].issuer
  client_id_list = ["sts.amazonaws.com"]
}

# Read the existing AWS Load Balancer Controller IAM policy
data "aws_iam_policy" "controller" {
  arn = var.controller_policy_arn
}

# Configure Helm to connect to the EKS cluster
provider "helm" {
  kubernetes = {
    host = data.aws_eks_cluster.this.endpoint

    cluster_ca_certificate = base64decode(
      data.aws_eks_cluster.this.certificate_authority[0].data
    )

    token = data.aws_eks_cluster_auth.this.token
  }
}
