terraform {
  required_version = ">= 1.10.0, < 2.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.62.0"
    }
  }
  backend "s3" {
    bucket = "labcart-terraform-state-mahesh1998"
    key    = "ecr/terraform.tfstate"
    region = "ap-south-1"
  }
}
