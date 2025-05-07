---
title: A Leaderboard for a crossfit competition
desc: |
    For an internal crossfit competion at my crossfit box, I proposed to the owner a little app/website for everyone to follow their progress during the competition.
tags:
  - python
  - postgresql
  - docker
  - vue
  - nuxt
---
{% import "macros/aws.njk" as aws %}

Welcome to the 2025 FWA Games!

![Public access](./assets/public.png){image-display}

When I found out that my CrossFit gym was planning an internal competition, I had an idea! Why not suggest a leaderboard app/website to the head coach? Well, I did just that and he accepted.

I needed a "frontend" engineer partner and luckily I knew a very brilliant one, [Christophe](https://chrsmsln.com). He agreed to join me on this journey. And we had **two months** to make it happen. Every two weeks we met with the coaches to understand the needs, define a specification, design a prototype and finally deliver a leaderboard webapp for the FWA crossfit games.

## The Features

How do you compute the score, how many athletes is there in a team, how many division are there? Is it possible to have mix teams? These were some of the questions we had for the coaches. With those questions answered we managed to provide:

The public has access to three pages:
  - A Home page with general information, competition schedule per team
  - A WOD (Workout of the Day, a crossfit workout) page, with details of the competition workouts
  - A leaderboard page with each team score and rank

In addition to the public access, there was an admin access for the coaches with a space to create athletes, teams, and WOD, to maange schedules and to input the leaderboard scores.

![Admin access](./assets/admin.png){image-display}

## Tech Stack

This was a rather classical (classical but not basic) CRUD, frontend, backend, database app.
Well the leaderboard in itself has its own set of challenges.

The figure below lists the different framework, tools, platform used to bring this project to life.
![Technical stack of the leaderboard webapp](./assets/stack-leaderboard.png){image-display color=light-img}
![Technical stack of the leaderboard webapp](./assets/stack-leaderboard-dark.png){image-display color=dark-img}

Let's take a closer look!

### Collaborative Tools

Our first step was to initialise a [Github](https://github.com/) repository.
Then, we noted all our questions and created tickets using Github Project. It was a good simple project management and tasks tacking tool.
All the UI/UX design work was done on [Figma](https://www.figma.com). I also used it for the database design schema!
We heavily used [Postman](https://www.postman.com) for API design, build and testing. All the API routes was created on Postman, which allow a smooth collaboration with Christophe on the front side.

{{ aws.info()}}  Honorable mention for [hurl](https://hurl.dev/). It would have been
Even though it was not a fit for this specific project, it was a happy discovery.

### Frontend Stack
For more info about the frontend please, head over to [Christophe's blog](https://blog.chrsmsln.com/posts/leaderboard)!


### Backend Stack
- Tooling
  - uv for project management (env management, python version management)
  - ruff
  - mypy
  - bandit
  - Makefile
  - code coverage with coverage.py
- CICD with Github Action
- API with Python FastAPI
- Authentication with ID and password, Authorization with OAuth and JWT
- Database: Postgresql
- Python DB ORM: Sqlalchemy
- Endpoints testing with Postman

### OPS Stack

This project was deployed using docker compose on a [Scaleway VPS](https://www.scaleway.com/en/cost-optimized-instances/).
[Traefik](https://traefik.io/traefik/) handles proxy communication and [Let's encrypt](https://letsencrypt.org/) TLS certificates.
A GitHub Actions (GHA) job is responsible for performing typical continuous integration tasks such as testing, linting, formatting, security checks. A [GHA runner is added](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/adding-self-hosted-runners) on our VPS (self-host runner). A deploy job uses this runner to perform the actual deployment on the prod server.

- VPS on scaleway
- Reverse proxy with Traefik
- TLS Certficate with let's encrypt
- Continous Deployment with Github Actions
- Containerisation with Docker
- Container Orchestration with Docker compose


### Observability Stack
- OpenTelemetry as the observability framework, with a OTel collector and python SDKs for instrumentation
- Managed Loki (Scaleway Cockpit) as log backend
- Managed Prometheus (Scaleway Cockpit) as a metrics backend
- Managed Grafana (Scaleway Cockpit) for telemetries visualisation

### Analitics Platform
- Umami as an analytics Platform


## What I learned!

- ORM work
- CRUD Database
- ...

## Ideas for improvement
- Anticipate Database schema migration (with Alembic) from the jump start
- Use ansible to automate my VPS management
  - software installation and update
  - user management
  - firewall management
  - backup and recovery automation