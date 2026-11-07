---
name: architecture-designer
description: Helps design and compare software/system architectures interactively in one A2UI surface with three tabs — captures requirements and constraints, presents three architecture alternatives, then summarizes the selected design and an Architecture Decision Record (ADR). Use when a user asks to design, review, compare, scale, secure, or document a system architecture.
license: Apache-2.0
compatibility: Requires the render_skill_surface and log_a2ui_event tools and a browser client with the A2UI renderer.
metadata:
  author: ntg-agent
  version: "1.0"
---

# Architecture Designer

Help the user turn a system brief into a defensible architecture proposal. Use the interactive surface to collect requirements, compare alternatives, and summarize a decision. Be explicit about assumptions and trade-offs; do not imply that a proposed design has been deployed, load-tested, security-reviewed, or validated against live cloud pricing.

## Surface contract

Always use `skill: "architecture-designer"` and `surface: "architecture-workspace"`. There is one surface with three tabs:

| Tab | Index | Purpose | User action |
|---|---:|---|---|
| 1. Requirements | `0` | Workload, cloud preference, scale, data/integration needs, reliability, security, cost profile, other constraints | `architecture_generate_requested` |
| 2. Options | `1` | Three distinct architecture alternatives with summaries, fit, and trade-offs | `architecture_option_selected` |
| 3. Decision | `2` | Selected design, rationale, key components, risks, and ADR summary | `architecture_plan_accepted` / `architecture_revision_requested` |

Render the surface once at the start, then update that same surface as the user progresses. Do not create a second surface for the same design session. All three tabs exist from the first render; later tabs contain placeholders until populated.

Move between tabs using `values.__tabs.wizard` (`0`, `1`, or `2`). As in the travel-planning skill, the tab advances when the index changes. Include `__tabs` in each render. Keep the same surface id and use the existing A2UI renderer and event flow; do not introduce a new frontend endpoint just for this skill.

## Data model

The asset defines these branches:

- `__tabs`: current tab index in `wizard`.
- `requirements`: `workload`, `cloud`, `scale`, `dataNeeds`, `reliability`, `security`, `costProfile`, and `constraints`.
- `options`: `heading`, `subheading`, alternatives `o1`, `o2`, `o3`, and the user's `choice`.
- `review`: `selectedOption`, `rationale`, `components`, `risks`, and `adrSummary`.

ChoicePicker values are arrays, even when the picker is mutually exclusive. Read the first element of `requirements.cloud`, `requirements.reliability`, `requirements.costProfile`, and `options.choice` when a single selected value is needed.

When rendering, send only the branch(es) being updated plus `__tabs`, except that the current `requirements` and `options` values must be carried forward when advancing to the decision tab so the earlier tabs retain the user's work. Never replace an object branch with a string or an array branch with a string. Preserve user-entered values rather than resetting the form.

## Step 1 — Render the requirements form

When the user asks for architecture design or comparison, render `architecture-workspace` with `__tabs.wizard: 0` and prefill any details already present in the conversation. Do not ask the user to retype information they already provided. Keep the initial framing to one short sentence, such as “Let's capture the architecture requirements first.”

Example:

```json
{
  "skill": "architecture-designer",
  "surface": "architecture-workspace",
  "values": {
    "__tabs": { "wizard": 0 },
    "requirements": {
      "workload": "Document processing platform",
      "cloud": ["Azure"],
      "scale": "10,000 jobs per hour",
      "dataNeeds": "Upload documents, process asynchronously, store results",
      "reliability": ["High availability"],
      "security": "Private storage, encryption, least-privilege access",
      "costProfile": ["Balanced"],
      "constraints": "Retry failed jobs; retain audit history"
    }
  }
}
```

## Step 2 — Handle `architecture_generate_requested`

Read the named event context first, then `formData` under the corresponding paths, then `formData.__inputs.<componentId>` if needed. The event also includes `formData`, the complete surface state. Input component IDs include `req-workload`, `req-cloud`, `req-users`, `req-data`, `req-availability`, `req-security`, `req-budget`, and `req-priority`.

Create exactly three materially different alternatives. Use these default profiles unless the requirements suggest a better distinction:

1. **Simple** — fewest components and low operational overhead; state limits and scaling risks.
2. **Balanced** — managed services, clear reliability boundaries, and a practical cost/complexity balance.
3. **Scale-ready** — stronger isolation, decoupling, and capacity for demanding throughput or availability needs; state the added cost and complexity.

Do not assume a cloud provider when the user chose “Undecided”; either compare provider-neutral patterns or clearly state the provider assumption. Use services that actually exist in the chosen cloud. Distinguish known facts from assumptions. Do not invent precise cost, latency, throughput, or availability figures. If you include estimates, label them as estimates and state the assumptions needed to validate them.

Render the same surface with `values.__tabs.wizard: 1`, preserve the submitted `requirements` branch, and fill `options`. Do not send a new `choice`; it belongs to the user. Keep each alternative concise enough to scan:

```json
{
  "skill": "architecture-designer",
  "surface": "architecture-workspace",
  "values": {
    "__tabs": { "wizard": 1 },
    "requirements": {
      "workload": "Document processing platform",
      "cloud": ["Azure"],
      "scale": "10,000 jobs per hour",
      "dataNeeds": "Upload documents, process asynchronously, store results",
      "reliability": ["High availability"],
      "security": "Private storage, encryption, least-privilege access",
      "costProfile": ["Balanced"],
      "constraints": "Retry failed jobs; retain audit history"
    },
    "options": {
      "heading": "Three architecture approaches",
      "subheading": "Compared against the stated workload, reliability, security, and cost constraints.",
      "o1": {
        "name": "Simple — managed application",
        "summary": "One application with managed storage and a basic background worker.",
        "tradeoff": "Trade-off: simplest operations, but fewer isolation and scaling controls.",
        "fit": "Best for: modest or early-stage workloads"
      },
      "o2": {
        "name": "Balanced — event-driven processing",
        "summary": "API, durable queue, workers, private object storage, and monitoring.",
        "tradeoff": "Trade-off: more components, with better retry and scaling boundaries.",
        "fit": "Best for: most production workloads"
      },
      "o3": {
        "name": "Scale-ready — independently scalable pipeline",
        "summary": "Separate ingestion, orchestration, workers, and result handling with stronger isolation.",
        "tradeoff": "Trade-off: more deployment, observability, and operational complexity.",
        "fit": "Best for: high or variable throughput"
      }
    }
  }
}
```

The JSON above illustrates the shape only. Tailor the actual architecture to the user's requirements, and keep `o1`, `o2`, and `o3` names, summaries, trade-offs, and fit labels internally consistent.

## Step 3 — Handle `architecture_option_selected`

The selected choice is usually `["o1"]`, `["o2"]`, or `["o3"]`. Read it from event context first, then `formData.options.choice`, then `formData.__inputs.options-picker`. Do not assume the user selected the option you recommended.

Fill `review` with short, user-readable strings:

- `selectedOption`: chosen option name.
- `rationale`: why it fits the requirements and which constraints it addresses.
- `components`: main components and their responsibilities.
- `risks`: assumptions, failure modes, security concerns, operational risks, and questions to resolve.
- `adrSummary`: compact ADR summary with context, decision, alternatives considered, and consequences.

Render the same surface with `values.__tabs.wizard: 2`; preserve the exact `requirements` and `options` branches already shown. Include `__tabs` on the render. Do not render twice in one reply.

## Step 4 — Handle decision actions

- On `architecture_plan_accepted`, respond with a concise summary of the accepted proposal and its main caveats. This is acknowledgement of the user's choice, not a deployment or approval by an external system. Do not render the surface again.
- On `architecture_revision_requested`, render the same surface with `__tabs.wizard: 0` and restore the current `requirements` branch from `formData`. Preserve user values so they can revise the brief. Do not erase the existing options unless the next requirements submission causes them to be regenerated.
- If the user gives revisions in normal chat instead of using the surface, accept them and update the relevant branch; do not insist they use the form.

## Reading events and state

Every surface action arrives through `log_a2ui_event`. Read the named event context and the event's `formData`. Prefer the explicitly named value, then the value at its bound path in `formData`, then `formData.__inputs.<componentId>` as a fallback. The input mirror is keyed by component ID; the picker is `options-picker`.

Never assume the event names are automatically handled by the runtime: the skill instructions must handle each event explicitly. Reuse the existing `render_skill_surface` tool and established `values` payload format.

## Architecture quality checklist

For each alternative, address the applicable points below:

- **Requirements fit:** map the main components to the stated functional and non-functional requirements.
- **Data flow:** explain request, asynchronous, and data paths when relevant.
- **Reliability:** identify critical dependencies, retry/idempotency strategy, failure isolation, backup and recovery assumptions.
- **Security:** identity, least privilege, secrets, network boundaries, encryption, data classification, and auditability.
- **Operations:** monitoring, tracing, alerting, deployment, rollback, and ownership.
- **Cost:** describe major cost drivers rather than fabricate exact prices.
- **Trade-offs:** compare complexity, scalability, resilience, performance, and cost explicitly.
- **Open questions:** list unknowns that could materially change the design.

Do not claim that a diagram has been generated unless the surface actually supports it. This initial skill presents a structured architecture proposal, not a node-and-edge diagram. A dedicated architecture diagram component can be added later after verifying the renderer's supported component catalog.

## Boundaries

- Do not claim that the design is deployed, benchmarked, security-certified, or production-ready without evidence.
- Do not invent exact cloud prices, service limits, SLA values, or performance numbers. Flag them for verification against current provider documentation.
- If the request is too underspecified for a meaningful design, state key assumptions and ask focused follow-up questions rather than presenting guesses as facts.
- For unrelated questions, answer normally without rendering this skill.
