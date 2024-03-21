---
title: How does an end to end ML project work?
desc: |
    In this article, I will describe the differents steps of an Machine Learning (ML) for tagging questions as seen on stackoverflow.
tags:
  - mlops
  - aws
  - cloud
  - architecture
  - python
---


I wanted a toy project to showcase the different steps that a Machine Learning (ML) project would take in a corporate setup.
So I created the tag generator project. I didn't really focused on the ML side. I didn't really fined tuned the model.
I was more interested in offering an engineering view on ML projects.

![MLOps lifecycle Schema](./assets/mlops_lifecycle.png){image-display}

## The Tag generator project
Below I describe the different steps I took to create the project. Some of those steps will, progressively, become fully fleged articles, where I will detail my choices, share my perspectives or write tutorials.

### The "Data Scientist" job
1) Find data and choose a problem to solve
2) Experiments with the dataset
3) Create the model

### The "Software Engineer" job
1) Structure the code using **monorep**
2) Setup a linting, formating and testing tool
3) Implement **CICD** for linting, building, testing and deploying your python code (with **Github Actions**)
4) Serving the model through an API (real time data processing strategy)
5) Code the API and Dockerize it
6) Code the UI (user interface) and Dockerize it
7) Use a **semantic release** tool to automatically release your code and tag your docker accordingly. Add the process to your **CICD** pipeline.

### The **"MLOPs Engineer"** job
1) Choose a deployment infrastructure: in our case **AWS**
2) Setup your AWS account in order to use it with IaC (infrastucure as code) tool (in our case **Terraform**)
3) Choose how you organise your **Terraform** code
4) Implement a **CICD** pipeline for deploying the terraform code for resource creating on AWS
4) Create your users with terraform
5) Create an S3 bucket and use it a "basic" model registry
6) Choose a model serving deployment architecture (An API deployed on AWS using Docker, ECR, ECS/Fargate)
7) Choose a UI deployment architecture (A streamlit web server deployed on AWS using Docker, ECR, ECS/Fargate)
8) Make the UI and the API talk together

## What's next?
What I would want to do next? (a mix of **"Data Scientist"**  and **"MLOPs Engineering"** job)
1) An automatic retraining job
2) A Performance monitoring of the model
3) A cost monitoring of the AWS infrastructure
 