---
title: Deploy your Terraform code on AWS with Github Actions
desc: |
    Do you want to know why you can create resources on AWS using Terraform and Github Actions ?
tags:
  - ci-cd
  - aws
  - github-actions
category: tutorial
---


## Introduction

Terraform is an Infrastucture as Code (IaC) software tool that uses a declarative, human-readable markup language to manage cloud services.

[Github Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions) is a Continous Integration/Continious Deployment platform that allows you to automate your build, test, and deployment pipeline.

The topic of today is how can you use Github Actions to create/update/delete your AWS resources using Terraform?
Obviously (or not :P), we need a github project, a terraform code and a github actions workflow

One question remains, how can you give your github actions workflow, rights to perform operations on AWS?
If you answer IAM users, I would reply, well yes it is fast and easy but the [good practice](https://docs.aws.amazon.com/IAM/latest/UserGuide/id.html) in term of security is to provide access to your resources through identity federation. The idea is to avoid having to store credentials as long-lived GitHub secrets and instead use IAM roles and short-term credentials. The good news is AWS supports [OpenID Connect](https://openid.net/developers/how-connect-works/). With OpenID Connect (OIDC), the github actions workflow requests a short-lived access token directly from the cloud provider.
All we need to do is to configure a trust relationship, on the cloud side, that controls which workflows are able to request the access tokens.

## Config on AWS

1) [create an IP](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
    - go to `IAM > Identity Providers > Add Provider`
    - To add an Identity Provider, you will need the info below found on the Github [Configuring OpenID Connect in Amazon Web Services](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services.) doc:
      - Provider URL: `https://token.actions.githubusercontent.com`
      - Audience: `sts.amazonaws.com`
    - Add tags (optional)
  


2) create the role that github actions will assume
    - go to `IAM > Roles > Create Role`
    - selected trusted entity. And in the **Custom trust policy** section copy paste the following json
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "Statement1",
          "Effect": "Allow",
          "Principal": {
            "Federated": "arn:aws:iam::<accountId>:oidc-provider/token.actions.githubusercontent.com"
          },
          "Action": "sts:AssumeRoleWithWebIdentity",
          "Condition": {
            "StringEquals": {
              "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
            },
            "StringLike": {
              "token.actions.githubusercontent.com:sub": "repo:<userName>/<repoName>:*"
            }
          }
        }
      ]
    }
    ```
    - Add permissions (managed one or customed)
    - Choose your role name, description and add tags
    ![AWS IAM > Identity Providers Creation](./assets/iam_roles_1.png){image-display}



## Write the code

### The terraform code

Let's say we want to create an s3 bucket

```tf{filename=s3.tf}
resource "aws_s3_bucket" "this" {
  bucket        = var.bucket_name
  force_destroy = false
}

resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.this.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "this" {
  depends_on = [aws_s3_bucket_ownership_controls.this]

  bucket = aws_s3_bucket.this.id
  acl    = "private"
}
resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = var.bucket_name
  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true
}
```

```tf{filename=variables.tf}
variable "bucket_name" {
  description = "Name of the s3 bucket. Must be unique."
  type        = string
}
```



### The github actions

Let's create our github actions for deploying the terraform code


```yaml
# This is a basic workflow to help you get started with Actions
name: deploy terraform on AWS using OIDC
on:
  workflow_dispatch:
  pull_request:
    types: [opened, synchronize, closed]
    branches:
      - main
    paths:
      - "iac/terraform/**"

permissions:
  id-token: write # This is required for aws oidc connection
  contents: read # This is required for actions/checkout
  pull-requests: write # This is required for gh bot to comment PR

jobs:
  deploy:
    steps:
      - name: Git checkout
        uses: actions/checkout@v4
      - name: Configure AWS credentials from AWS account
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ secrets.AWS_REGION }}
          role-session-name: docker-for-github
      # Test that your workflow and continue with your workflow
      - name: Sts GetCallerIdentity
        run: |
          aws sts get-caller-identity
      ...
  ```
