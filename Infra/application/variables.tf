
variable "aws_region" {
  description = "AWS region hosting the EKS cluster"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "Existing EKS cluster name"
  type        = string
  default     = "labcart-prod"
}

variable "namespace" {
  description = "Kubernetes application namespace"
  type        = string
  default     = "labcart"
}
