
# ---------------------------------------------------------
# AWS Load Balancer Controller - IAM Trust Policy
# ---------------------------------------------------------

data "aws_iam_policy_document" "controller_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type = "Federated"

      identifiers = [
        aws_iam_openid_connect_provider.eks.arn
      ]
    }

    condition {
      test = "StringEquals"

      variable = "${replace(
        aws_iam_openid_connect_provider.eks.url,
        "https://",
        ""
      )}:sub"

      values = [
        "system:serviceaccount:kube-system:aws-load-balancer-controller"
      ]
    }

    condition {
      test = "StringEquals"

      variable = "${replace(
        aws_iam_openid_connect_provider.eks.url,
        "https://",
        ""
      )}:aud"

      values = ["sts.amazonaws.com"]
    }
  }
}

# ---------------------------------------------------------
# IAM Role - AWS Load Balancer Controller
# ---------------------------------------------------------

resource "aws_iam_role" "controller" {
  name               = var.controller_role_name
  assume_role_policy = data.aws_iam_policy_document.controller_assume_role.json

  tags = {
    "alpha.eksctl.io/cluster-name"                = var.cluster_name
    "alpha.eksctl.io/iamserviceaccount-name"      = "kube-system/aws-load-balancer-controller"
    "alpha.eksctl.io/eksctl-version"              = "0.231.0"
    "eksctl.cluster.k8s.io/v1alpha1/cluster-name" = var.cluster_name
  }
}

# ---------------------------------------------------------
# Attach Existing IAM Policy
# ---------------------------------------------------------

resource "aws_iam_role_policy_attachment" "controller" {
  role       = aws_iam_role.controller.name
  policy_arn = data.aws_iam_policy.controller.arn
}

# ---------------------------------------------------------
# AWS Load Balancer Controller - Helm Release
# ---------------------------------------------------------
resource "helm_release" "aws_load_balancer_controller" {
  name      = "aws-load-balancer-controller"
  namespace = "kube-system"

  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = "3.6.0"

  # Reuse existing Helm values where available.
  reuse_values = true

  values = [
    yamlencode({
      clusterName = var.cluster_name
      region      = var.aws_region
      vpcId       = var.vpc_id

      serviceAccount = {
        create = true
        name   = "aws-load-balancer-controller"

        annotations = {
          "eks.amazonaws.com/role-arn" = aws_iam_role.controller.arn
        }
      }
    })
  ]

  depends_on = [
    aws_iam_role_policy_attachment.controller
  ]

  timeout = 600
  wait    = true
}

