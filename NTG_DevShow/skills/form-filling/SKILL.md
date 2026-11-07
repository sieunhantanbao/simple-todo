---
name: form-filling
description: Fills structured forms through natural conversation and one interactive A2UI surface. Use when the user wants help completing a form, especially a security incident report, by providing information conversationally instead of entering every field manually. The assistant must preserve user-provided values, ask for missing required details, and must not claim a form was submitted until the user submits it.
license: Apache-2.0
compatibility: Requires the render_skill_surface tool and a browser client with the A2UI renderer.
metadata:
  author: ntg-agent
  version: "1.0"
---

# Form filling

You help the user complete a structured form through conversation. The bundled example is a
security incident report based on the CopilotKit form-filling example. The user can describe the
incident in ordinary language and you should place the details they provide into the visible form.
The user can edit every value before submitting it.

This is a demonstration form. Do not invent incident facts, identities, dates, severity, or
recommended actions. Do not claim that a report was sent, accepted, or assigned until the user
submits the form and the `incident_report_submitted` event arrives.

## The surface

Always use `skill: "form-filling"` and `surface: "incident-report"`. There is one surface for the
whole flow. Render it once when the user asks for help completing an incident report, then render
the same surface again only when you have new values to place into the form. Never create a second
surface for the same report.

The fields are:

| Branch | Field | Type | Meaning |
|---|---|---|---|
| `report` | `name` | string | Full name of the reporter |
| `report` | `email` | string | Contact email |
| `report` | `incidentType` | array | One selected value: `phishing`, `malware`, `data_breach`, `unauthorized_access`, `ddos`, or `other` |
| `report` | `date` | `YYYY-MM-DD` string | Date the incident occurred |
| `report` | `impactLevel` | array | One selected value: `low`, `medium`, `high`, or `critical` |
| `report` | `description` | string | What happened, how it was discovered, and relevant details |
| `report` | `suggestedActions` | string | Actions the user recommends or believes should be taken |

All values live under the `report` object. Send the complete `report` branch when rendering values.
Do not send a scalar such as `{"report": "..."}` because that changes the expected object shape.

## Step 1 - Open or update the form

When the user asks to fill out an incident report, call `render_skill_surface` with the known
values pre-filled. Carry over every detail the user already supplied; never make them repeat it.
Leave unknown fields at their seeded defaults and ask a concise question for the next missing
required value when needed.

```json
{
  "skill": "form-filling",
  "surface": "incident-report",
  "values": {
    "report": {
      "name": "Alex Morgan",
      "email": "alex@example.com",
      "incidentType": ["phishing"],
      "date": "2026-09-28",
      "impactLevel": ["medium"],
      "description": "A suspicious message requested an urgent password reset.",
      "suggestedActions": "Block the sender and reset the affected credentials."
    }
  }
}
```

Only include values the user actually gave you or clearly confirmed. A short framing sentence
before the surface is enough; do not repeat the form fields in prose. After rendering, stop and
wait for the user's next message or form action.

## Updating conversationally supplied values

When the user provides more details in text, call `load_skill` again first because a loaded skill
lasts for one reply only. Then render `incident-report` again with the `report` branch containing
the known values and the new details. Preserve existing values when the user only changes one
field. If the user corrects a value, replace it with the correction.

Use the exact controlled values for the two pickers. `incidentType` and `impactLevel` are arrays
containing at most one selected value, even though each picker is single-select. The selected
`incidentType` must be one of the six values listed above, and the selected `impactLevel` must be
one of the four values listed above. If the user's wording is ambiguous, ask which option fits
instead of guessing. Dates must use `YYYY-MM-DD`.

The incident description should explain what happened and how it was discovered. Suggested
actions should be based on the user's information, not invented as confirmed security advice.
Do not silently turn a vague statement into a detailed incident narrative.

## Reading the submitted form

The `incident_report_submitted` action contains the named values and a `formData` object with the
complete surface state. Read values in this order:

1. The named action value, such as `description` or `impactLevel`.
2. The matching bound value under `formData.report`.
3. The client fallback under `formData.__inputs.<componentId>` when a field is missing.

The fallback component ids are `report-name`, `report-email`, `report-type`, `report-date`,
`report-impact`, `report-description`, and `report-actions`.

When the event arrives, summarize the values received and say that the report is ready for the
application to process. Do not claim it was delivered, stored, assigned, or reviewed unless a
separate application response explicitly confirms that outcome. If the user submits incomplete
or invalid data, identify the missing field and re-render the same surface with the values already
present.

## Gotchas

- Render only one `incident-report` surface for this flow; re-rendering updates the existing form.
- Call `load_skill` again on every later turn that continues the flow.
- Never overwrite known answers with empty strings when updating one field.
- Do not invent a reporter name, email address, incident details, or security conclusion.
- If the user answers in text, accept it and fill the form; do not require button interaction.
- Questions about general security advice that are not asking to complete the report can be
  answered normally without rendering the form.