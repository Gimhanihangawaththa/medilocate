terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "local" {}
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "ap-south-1"
}

resource "aws_instance" "medilocate_server" {
  ami           = "ami-0dee22c13ea7a9a67"
  instance_type = "t3.micro"

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              yum install -y docker
              systemctl start docker
              docker run -d -p 3000:80 gimshi/medilocate_frontend:latest
              docker run -d -p 4000:4000 gimshi/medilocate_backend:latest
              EOF

  tags = {
    Name = "Medilocate-Auto-Deploy"
  }
}
