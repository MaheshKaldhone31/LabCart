variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "cluster_name" {
  type    = string
  default = "labcart-prod"
}

variable "vpc_id" {
  type    = string
  default = "vpc-05919cb4e11d57ee7"
}

variable "controller_role_name" {
  type    = string
  default = "eksctl-labcart-prod-addon-iamserviceaccount-k-Role1-3aXfzDtBmKJS"
}

variable "controller_policy_arn" {
  type    = string
  default = "arn:aws:iam::223901279187:policy/AWSLoadBalancerControllerIAMPolicy"
}