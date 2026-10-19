output "controller_role_arn" {
  value = aws_iam_role.controller.arn
}

output "controller_policy_arn" {
  value = data.aws_iam_policy.controller.arn
}

output "oidc_provider_arn" {
  value = data.aws_iam_openid_connect_provider.eks.arn
}