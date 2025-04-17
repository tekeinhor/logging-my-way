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

https://www.scaleway.com/en/docs/cockpit/how-to/send-metrics-logs-to-cockpit/
https://www.scaleway.com/en/developers/api/cockpit/v1/global-api/
https://grafana.com/docs/mimir/latest/configure/configure-otel-collector/
https://opentelemetry.io/docs/collector/configuration/
https://opentelemetry.io/docs/collector/configuration/#environment-variables

https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/recommendation/recommendation_server.py
https://github.com/open-telemetry/opentelemetry-python/blob/main/docs/examples/metrics/instruments/example.py


https://sysdig.com/blog/prometheus-remote-write-opentelemetry/