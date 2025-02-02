---
title: A minimal example of manual instrumentation with opentelemetry in python 
desc: |
    This article's topic is observability. How can we use opentelemetry to achieve this goal?
tags:
  - ops
  - observability
  - python
  - docker
---


## Let's start with OpenTelemetry

## Observability stack

### Traces
- Trace receiver: OTEL
- Trace exporter: Jaeger

### Logs
- Logs receiver: File
- Logs exporter: Loki

### Metrics
- Logs receiver: OTEL
- Logs exporter: Prometheus


## Conclusion
And just like that, we've build our opentelemetry stack.