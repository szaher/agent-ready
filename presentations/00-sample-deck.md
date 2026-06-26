---
marp: true
theme: academy
header: 'Academy Template'
footer: 'Sample Deck'
paginate: true
---

<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
mermaid.initialize({ startOnLoad: true, theme: "base", themeVariables: { primaryColor: "#e0f0ff", primaryTextColor: "#151515", primaryBorderColor: "#0066cc", lineColor: "#0066cc", secondaryColor: "#daf2f2", tertiaryColor: "#f2f2f2", noteBkgColor: "#fef0f0", noteTextColor: "#151515", fontFamily: "Red Hat Text, sans-serif" }});
</script>

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Academy Template

## A Sample Deck for Slide Patterns

Presenter Name | Date

<!-- This is the title slide using the lead class. Dark background, centered text. -->

---

# Agenda

- Introduction and objectives
- Core concepts overview
- Architecture walkthrough
- Data comparison table
- Diagram example
- Code walkthrough
- Key insights and takeaways
- Hands-on exercise
- Summary and next steps
- Q&A

<!-- Speaker note: Use this agenda slide to set expectations for the session. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 1

## Foundations and Core Concepts

Laying the groundwork before diving into details.

<!-- Section dividers break the presentation into logical parts. -->

---

# Core Concepts

Understanding the fundamentals is essential before moving to advanced topics.

- **Concept A** -- The foundational building block
- **Concept B** -- Enables scaling and distribution
- **Concept C** -- Provides fault tolerance and recovery
- **Concept D** -- Handles orchestration and scheduling

> These four pillars form the basis of the entire system architecture.

<!-- Speaker note: Spend about 3 minutes on this slide. Let participants ask questions. -->

---

# Feature Comparison

| Feature        | Approach A     | Approach B     | Approach C     |
|----------------|----------------|----------------|----------------|
| Scalability    | <span class="vs-good">Excellent</span> | <span class="vs-neutral">Moderate</span> | <span class="vs-bad">Limited</span> |
| Complexity     | <span class="vs-bad">High</span> | <span class="vs-good">Low</span> | <span class="vs-neutral">Medium</span> |
| Performance    | <span class="vs-good">Fast</span> | <span class="vs-neutral">Average</span> | <span class="vs-good">Fast</span> |
| Cost           | <span class="vs-bad">Expensive</span> | <span class="vs-good">Cheap</span> | <span class="vs-neutral">Moderate</span> |
| Maintenance    | <span class="vs-neutral">Medium</span> | <span class="vs-good">Easy</span> | <span class="vs-bad">Difficult</span> |

*Choose the approach that best fits your constraints and requirements.*

<!-- Speaker note: Walk through each row. Highlight that there is no single best approach. -->

---

# System Architecture

<div class="mermaid">
graph LR
    A[Client] --> B[API Gateway]
    B --> C[Service A]
    B --> D[Service B]
    C --> E[(Database)]
    D --> E
    C --> F[Cache Layer]
    D --> F
    F --> G[Message Queue]
    G --> H[Worker Pool]
</div>

The system follows a microservices pattern with shared caching and asynchronous processing.

<!-- Speaker note: Trace the data flow from client to worker pool. -->

---

# Code Example

## Configuration File

```yaml
service:
  name: my-service
  version: 1.0.0
  replicas: 3

resources:
  cpu: "2"
  memory: "4Gi"

scaling:
  min_replicas: 2
  max_replicas: 10
  target_cpu_utilization: 75
```

Use this configuration as a starting point and adjust based on your workload.

<!-- Speaker note: Point out the scaling section -- this is where most tuning happens. -->

---

# Implementation Example

## Python

```python
from framework import Pipeline, Stage

class DataProcessor(Pipeline):
    def __init__(self, config):
        self.config = config
        self.stages = [
            Stage("ingest", self.ingest_data),
            Stage("transform", self.transform_data),
            Stage("validate", self.validate_output),
        ]

    def ingest_data(self, source):
        """Read data from the configured source."""
        return self.reader.read(source, batch_size=1000)

    def transform_data(self, batch):
        """Apply transformations to each batch."""
        return [self.apply_rules(record) for record in batch]
```

<!-- Speaker note: This is a simplified version. The real implementation handles errors and retries. -->

---

# Key Insight

> **Design for failure, not just for success.**
>
> Every component should assume that any dependency can fail at any time.
> Build retry logic, circuit breakers, and graceful degradation into every layer.

<div class="callout">

**Tip:** Start by identifying your critical path, then add resilience patterns to each step along that path.

</div>

<!-- Speaker note: This is the single most important takeaway from this section. -->

---

<!-- _class: section-divider -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Part 2

## Hands-On Practice

Time to apply what we have learned.

<!-- Transition to the practical portion of the session. -->

---

# Exercise Overview

## What You Will Build

1. **Set up** the development environment
2. **Implement** the data ingestion pipeline
3. **Configure** the scaling parameters
4. **Test** with a sample dataset
5. **Monitor** the results in the dashboard

### Time Estimate

| Step           | Duration   |
|----------------|------------|
| Setup          | 10 minutes |
| Implementation | 20 minutes |
| Testing        | 10 minutes |
| Review         | 5 minutes  |

<!-- Speaker note: Circulate and help participants who get stuck on setup. -->

---

# Workflow Diagram

<div class="mermaid">
flowchart TD
    A[Start Exercise] --> B{Environment Ready?}
    B -->|Yes| C[Write Pipeline Code]
    B -->|No| D[Run Setup Script]
    D --> B
    C --> E[Run Tests]
    E --> F{Tests Pass?}
    F -->|Yes| G[Submit Results]
    F -->|No| H[Debug and Fix]
    H --> E
    G --> I[Done]
</div>

Follow this workflow to complete the exercise. Ask for help if you are stuck for more than 5 minutes.

<!-- Speaker note: Emphasize the debug loop -- it is normal to iterate. -->

---

# Common Pitfalls

Avoid these frequent mistakes when working with the system:

- **Pitfall 1:** Forgetting to set the batch size -- defaults are rarely optimal
- **Pitfall 2:** Not handling connection timeouts -- the default is too long
- **Pitfall 3:** Ignoring backpressure signals -- this leads to memory exhaustion

### How to Avoid Them

```bash
# Always validate your configuration before deploying
./validate-config.sh --strict

# Monitor resource usage during the first run
./monitor.sh --interval 5s --duration 10m
```

<!-- Speaker note: Share a war story about pitfall 3 if time allows. -->

---

# Summary

## What We Covered

- **Foundations:** Core concepts A through D and why they matter
- **Architecture:** Microservices pattern with caching and async processing
- **Configuration:** How to set up and tune the system
- **Hands-on:** Building a pipeline from scratch
- **Best practices:** Design for failure, validate early, monitor always

## Next Steps

1. Complete the exercise if you have not finished
2. Review the reference documentation
3. Try extending the pipeline with a custom stage
4. Join the community channel for ongoing support

<!-- Speaker note: Point participants to the follow-up resources page. -->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _header: '' -->
<!-- _footer: '' -->

# Questions?

## Thank you for attending

Feedback and follow-up: team@example.com

<!-- End of presentation. -->
