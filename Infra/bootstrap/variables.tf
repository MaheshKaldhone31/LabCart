variable "aws_region" {
  type        = string
  description = "AWS region for the Terraform state bucket."
  default     = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "labcart"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "state_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for Terraform state."
}
