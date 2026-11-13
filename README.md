# BNPersona

A green-and-white corporate banking demo with product-led discovery, persistent client personas, source evidence, editable engagement guides, banker review, PDF/DOCX/text ingestion, reviewed feedback, market-event analysis, portfolio analytics, saved clients and activity history.

## Run locally

Node 22 or later is required.

```
npm install
npm run dev
```

Open http://localhost:3000. The app works using transparent demo rules without credentials. Synthetic changes persist in this browser. Reset demo restores the starting data. The Specialist and Relationship manager roles share the coverage workspace; Restricted desk uses a separate portfolio. Role switching is a simulation, not production authentication.

## Enable live AI

On Vercel, the server uses the deployment's OIDC connection to AI Gateway. A verified catalog model is configured in the server and can be overridden with AI_GATEWAY_MODEL. Gateway access depends on the account's credits and verification. Outputs are labeled Live AI only after a successful request; provider failure returns a labeled Demo rules result.

Alternatively set GOOGLE_GENERATIVE_AI_API_KEY in an uncommitted .env.local or in Vercel's server-side project environment variables. Set GEMINI_MODEL to a model supported by the account. Never use NEXT_PUBLIC_ for a key, paste a key into chat, or add secrets to source control. Redeploy after changing hosted environment variables.

Live AI supports product interpretation, qualitative extraction, tailored preparation, rehearsal, and event mechanism summaries. Eligibility, estimates, currency calculations, approvals and portfolio totals are ordinary application logic.

## Demo

Matthew Ding works with 30 authorized synthetic client personas. Describe FX forwards, find potential clients, inspect ranking explanations, save Volvo Group, open the interactive company relationship map and its evidence, then prepare a source-grounded persona briefing followed by the editable engagement guide. The briefing covers business impact, scalability, decision criteria, communication structure, previous outcomes and likely reservations. Suggested reactions are labeled as hypotheses. Request RM review, switch to Relationship manager, approve the version and export it manually. In Data Hub, the Hedge feedback example changes Volvo Group's hedged amount to MXN 6m while retaining the MXN 18m gross payable. Approve the changes and refresh the outdated guide to show MXN 12m remaining unhedged. Market Events scrolls to the affected relationships after analysis. Portfolio Analytics reuses the same 30-client state. The fixed demo calendar is as of Nov 12, 2026. Sources, deadlines, histories and guide text display calendar dates. A Nov 30 payment has 18 days remaining; it is not a predicted purchase date. Source entry and proposed date updates use date pickers. Existing browser data migrates without losing saved work; guides from the earlier format are retained and flagged for refresh.

The persona map connects the company to leadership, financial position, customers and suppliers, interests, goals, decision process, communication and past engagements. Click a dimension for source-linked detail, questions to ask and a preparation or capture action. Cards view provides a reading alternative. Unknown information is explicitly marked for confirmation.

## Checks

```
npm run typecheck
npm test
npm run build
```

## Prototype boundaries

All records and events are synthetic. Client state and activity are browser-persisted, not a multiuser bank database or tamper-proof audit store. Source entitlement filtering and API client allowlists illustrate information barriers, but demo roles are user selectable. A bank rollout requires actual authentication, server-held authorization, secure durable storage, approved model use and retention, monitoring, and a global abuse-control layer. Per-instance AI throttling is a demo safeguard rather than a production quota. There is no automatic outreach, transaction execution, or live price feed. Advanced trained Prioritize is deferred.




## Expanded BNP workspace

Product discovery now covers FX, trade finance, cash management, supply chain finance, corporate financing, debt and equity capital markets, M&A advisory, interest-rate and commodity risk, sustainable finance, securities services, and custom banking solutions. These are demo templates based on BNP Paribas public business descriptions, not approved product documentation or terms.

Gemini extraction proposes separate reporting requirements, competitor comparisons, presentation preferences, implementation requirements and meeting observations in addition to classic exposure fields. Every proposal includes an exact source excerpt and requires banker review. Distinct requirements sharing a category are preserved. Approved requirements become map branches, are highlighted as new or updated, and are included in preparation guides. Meeting observations are marked for confirmation.

The Data Hub source-type tiles select a source type and scroll to the source form. Longer synthetic examples demonstrate realistic extraction. An empty shortlist suggests accessible clients. Guide generation uses inline progress while the persona remains available. The logo depicts a suited persona within a target.


## Persona workspaces and semantic extraction

Saved Clients and Data Hub open the general client persona at `/clients/{id}`. This view contains the relationship map, reviewed evidence, client information and Ask the persona, without product-fit estimates or a tailored guide. Product Discovery opens `/clients/{id}?productId=...`; that context adds relevance and receptiveness above the map and enables product-specific preparation. Approved Data Hub updates add the relationship to Saved Clients when necessary.

The map has seven stable themes. Atomic requirements, rationale, decision criteria, chart-to-purpose mappings and observations are grouped beneath those themes. A tidy bilateral hierarchy assigns disjoint vertical bands to subtrees and separate columns to each depth; cards never overlap as insights accumulate. Zoom, pan, branch focus and subtree collapse/expand remain available. Reviewed evidence is opened from the inspector rather than duplicated as a mandatory leaf below every fact.

Gemini returns atomic, semantically grouped proposals with exact source excerpts. Typographic quotation and whitespace differences are aligned to the actual source span; unsupported paraphrased excerpts are rejected. Reporting rigor and simple presentation are distinct dimensions. Meeting observations and commercial inferences remain explicitly uncertain. Banker approval preserves multiple requirements of the same kind. Ask the persona answers from reviewed facts and source IDs; it does not represent a real client speaking.


## Persona-led opportunity briefs and persona Q&A

Discovery results explain a business need, a barrier and a suggested approach. The product-specific persona has a six-part opportunity brief: why it matters, why now, what could win the conversation, what could derail it, an opening, and unknowns. Readiness for discussion replaces the acceptance label and includes supporting and limiting evidence. Persona coverage is shown separately from exposure evidence. Suggestions are labeled; missing decision criteria or history is not invented.

Ask the persona offers Quantitative data, Qualitative data, Behavioral data and All three question starters. Responses render CommonMark/GFM headings, lists, emphasis and tables through react-markdown, with raw HTML disabled. Specific chart types are not inferred from a spreadsheet or executive-summary preference. Dates render on the demo calendar and behavioral observations remain distinct from documented requests.

Client URLs use company slugs, such as /clients/volvo-group and /clients/airbus. Legacy demo links redirect to the matching company; cached client references and evidence identifiers migrate together, preserving uploads, saved clients and reviewed guides.
