variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "labcart"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "cluster_name" {
  type    = string
  default = "labcart-prod"
}

variable "kubernetes_version" {
  type    = string
  default = "1.34"
}

variable "vpc_id" {
  type    = string
  default = "vpc-0fd1587fac8c3be7e"
}

variable "private_subnet_id" {
  type    = string
  default = "subnet-0e312e0fa46a7e0c3"
}

variable "private_subnet_2_id" {
  type    = string
  default = "subnet-0ef5428b347d80ab3"
}

variable "node_instance_types" {
  type    = list(string)
  default = ["t3.small"]
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_min_size" {
  type    = number
  default = 2
}

variable "node_max_size" {
  type    = number
  default = 3
}