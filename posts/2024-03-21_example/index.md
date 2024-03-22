---
title: An example of a simple end-to-end Machine Learning project
desc: |
    In this article, I will describe the differents steps of an Machine Learning (ML) project for question tagging using stackoverflow data.
tags:
  - mlops
  - aws
  - cloud
  - architecture
  - python
---


## Introduction
I wanted a toy project to showcase the different steps that a Machine Learning (ML) project would take in a corporate setup.
So I created the [tag generator project](https://github.com/tekeinhor/tag-generator). I didn't really focused on the ML side. I didn't really fined tuned the model.
I was more interested in offering an engineering view on ML projects.

![MLOps pipeline lifecycle](./assets/mlops_lifecycle.png){image-display}

The image above represent my view of a what a complete ML pipeline (should) look like when the fundamental principles of software engineerning and devops are applied. You need the different building blocks, we see in the figure, to have a productive, maintainable, reliable and efficient project. Those building blocks are:
1) A **data pipeline**: it is where the data cleaning and processing start. It is then followed by the feature engineering step. (Some people will add the feature store here). I separated this block from the Training pipeline block to highlight the fact that "Feature creation" is also a step needed when serving the model. 
2) A **(re)training pipeline**: The star of the show. It is where the magic happens they say. It is where the model is created and engineered.
3) A **CICD**: Because eveything we are talking about is actual code, it is where we make sure that we follow the basic rule of code integration, testing etc. 
4) A **model registry**: where we store the model. I can be a simple AWS S3 bucket to a more sophisticated tool like proposed in MLFlow. 
5) A **model serving pipeline**: here we need think about how our model is going to be used and create the appropriate service for that.
6) A **performance monitoring setup**: 

Depending on the level of automation of the blocks, we speak of "maturity level". For more info about Maturity level, you can read [this article](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning) from Google Cloud Architecture Center. In this project, I focused on blocks **3** and **5**. And hopefully in the future, I could add **1**, **2** and **6**.

## The Tag generator project
Below I describe the different steps I took to create the project. Some of those steps will, progressively, become fully fleged articles, where I will detail my choices, share my perspectives or write tutorials.

### The "Data Scientist" job
1) Find data and choose a problem to solve
2) Experiments with the dataset
3) Create the model

### The "Software Engineer" job
1) Structure the code using **monorepo**
2) Setup a linting, formating and testing tool
3) Implement **CICD** for linting, building, testing and deploying your python code (with **Github Actions**)
4) Serving the model through an API (real time data processing strategy)
5) Code the API and Dockerize it
6) Code the UI (user interface) and Dockerize it
7) Use a **semantic release** tool to automatically release your code and tag your docker accordingly. Add the process to your **CICD** pipeline.

### The **"MLOPs Engineer"** job
1) Choose a deployment infrastructure: in our case **AWS**
2) Setup your AWS account in order to use it with IaC (infrastucure as code) tool: in our case **Terraform**
3) Choose how you organise your **Terraform** code
4) Implement a **CICD** pipeline for deploying your resource creation process on AWS using Terraform
4) Create your users and give them rights with terraform
5) Create an S3 bucket and use it a "basic" model registry
6) Choose a model serving deployment architecture (An API deployed on AWS using Docker, ECR, ECS/Fargate)
7) Choose a UI deployment architecture (A streamlit web server deployed on AWS using Docker, ECR, ECS/Fargate)
8) Make the UI and the API talk together

## What's next?
What I would want to do next? (a mix of **"Data Scientist"**  and **"MLOPs Engineering"** job)
1) An automatic retraining job
2) A Performance monitoring of the model
3) A cost monitoring of the AWS infrastructure
 