# BNPersona

BNPersona is a corporate banking client-intelligence prototype that connects reviewed client evidence to product discovery, relationship research, engagement preparation, and feedback. A banker can identify a relevant conversation, inspect its supporting sources, prepare a discussion guide, simulate relationship-manager review, and export the approved version manually.

**Real company names, synthetic personas.** Contacts, financial figures, meeting notes, preferences, opportunities, events, and outcomes are fictional. Public BNP Paribas references provide background for company names and product families; they do not substantiate the invented client records or imply endorsement. Use synthetic information when trying uploads or AI features.

The standard demo needs no AI credentials, database, or external business service. Optional server-side AI improves interpretation and language generation; deterministic application rules retain control of matching, calculations, state updates, and review checks.

## Contents

- [Quick start](#quick-start)
- [Workspace and navigation](#workspace-and-navigation)
- [Step-by-step workflows](#step-by-step-workflows)
- [Architecture and source map](#architecture-and-source-map)
- [Data model, persistence, and migration](#data-model-persistence-and-migration)
- [Matching, evidence, and financial calculations](#matching-evidence-and-financial-calculations)
- [AI configuration and execution](#ai-configuration-and-execution)
- [HTTP API reference](#http-api-reference)
- [Validation and development workflow](#validation-and-development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Prototype boundaries](#prototype-boundaries)
- [License and assets](#license-and-assets)

## Quick start

### Prerequisites

- Node.js **22 or later**, as required by `package.json`, and npm.
- A modern browser with JavaScript and local storage enabled.
- Git access to this repository and package-registry access for installation.

The application uses Next.js **16.4.6**, React **19.2.0**, and TypeScript in strict mode. `package-lock.json` records the resolved dependency graph. No database migration, Docker service, or seed command is required.

### Install and run

```bash
git clone https://github.com/Md905908324/BNPersona.git
cd BNPersona
npm ci
npm run dev
```

If the repository is already checked out, run the last two commands from its root. In a managed cloud task, use the existing isolated checkout; create a worktree only if explicitly requested.

On your local computer, open `http://localhost:3000`. Both development and production scripts bind to `0.0.0.0`. To choose another port:

```bash
npm run dev -- --port 3001
```

For a repeatable walkthrough, open **Workspace settings**, select **Specialist**, and turn off **Use live AI when available**. This forces the transparent **Demo rules** path even if provider credentials are present. **Reset demonstration** restores the seed portfolio and removes this browser's saved work in both demo workspaces; export anything needed first.

### Production build on your computer

```bash
npm run build
npm run start
```

`start` serves the existing `.next` build; run `build` first. This app requires a Node.js/serverless runtime for its API routes and is not configured as a static export.

## Workspace and navigation

| Screen | Route | Purpose |
| --- | --- | --- |
| Product Discovery | `/` or `/discover` | Define a product, filter eligible clients, inspect ranking explanations, and save opportunities. |
| Saved Clients | `/saved` | Maintain product-linked shortlist notes, owners, and workflow statuses. |
| General persona | `/clients/volvo-group` | Read relationship knowledge, inspect sources and history, and ask evidence-grounded questions. |
| Product-specific persona | `/clients/volvo-group?productId=fx-forward` | Add an opportunity brief and product-specific preparation controls. |
| Prepared approach | `/clients/volvo-group/prepare?productId=fx-forward` | Read/edit a guide, request review, rehearse, and export after approval. |
| Data Hub | `/data` or `/data?client=volvo-group` | Read documents, extract proposals, review conflicts, and approve source-linked updates. |
| Market & Industry Events | `/events` | Describe a synthetic event and identify potentially affected relationships. |
| Portfolio Analytics | `/analytics` | Filter portfolio counts, evidence coverage, and primary product themes; drill into records. |
| Activity | `/activity` | Inspect actions recorded in this browser's workspace. |

**Product context is stateful.** The persona uses `state.product`, not a product fetched by the query-string ID. The presence of `productId` enables product context; it does not independently restore the named product in a new browser. Select the intended product in Discovery before opening a preparation link. Saved Clients, Data Hub, and event results open a general persona; use Discovery to enter a product-specific workflow.

### Roles and portfolio scope

| Demo role | Seed portfolio | Storage scope | Intended use |
| --- | --- | --- | --- |
| Specialist | 30 clients: 19 FX, 5 trade finance, 6 cash management | Shared `coverage` workspace | Research and prepare discussions. |
| Relationship manager | Same 30 clients | Same `coverage` workspace | Review, return, or approve guides in the same browser. |
| Restricted desk | One fictional Juniper Infrastructure relationship | Separate `restricted` workspace | Demonstrate filtered access and information barriers. |

Role switching is a UI simulation, not authentication. Switching browsers or computers does not transfer these workspaces.

### Calendar conventions

The business scenario is fixed **as of November 12, 2026**, regardless of the current date. `timeline.ts` uses November 10, 2026 UTC as day zero and `SCENARIO_DAY = 2` as the reference date.

| Stored day offset | Displayed date | Meaning |
| --- | --- | --- |
| `0` | Nov 10, 2026 | Calendar base. |
| `2` | Nov 12, 2026 | Fixed scenario reference date. |
| `20` | Nov 30, 2026 | Cemex deadline, 18 days after the reference date. |
| `60` | Jan 9, 2027 | Volvo Group deadline, 58 days after the reference date. |

The header clock separately displays the current time in `America/New_York`. Activity and guide timestamps also use actual time. Deadlines indicate recorded obligations or reviews, not predicted purchase dates. Source dates in Data Hub must be within offsets `-1000` through `2`; proposed obligation dates are a separate field.

## Step-by-step workflows

### 1. Find a relevant client and export a reviewed approach

**Best for:** a first demonstration of the complete product-specialist workflow. Use one client throughout to keep the rationale and evidence traceable.

1. In **Workspace settings**, choose **Specialist** and select demo mode for deterministic results. If starting fresh is appropriate, reset the demonstration.
2. Open **Product Discovery**, select **Foreign exchange**, and retain the FX-forward template. Keep the default 90-day horizon and supported currency list, or narrow currencies to `MXN` to focus the example.
3. Click **Find potential clients**. Review urgency, readiness for discussion, and exposure evidence separately. Click a readiness indicator to inspect supporting and limiting evidence. Expand the excluded suggestions to see why a client is unavailable.
4. Search for **Volvo Group** and save it using the bookmark. Open the client from Discovery so the URL includes product context.
5. Review the six-part opportunity brief: why the need matters, why now, what could win the conversation, what could derail it, a suggested opening, and remaining unknowns. Inspect the linked source behind a material claim.
6. Explore the map, then verify the gross payable, existing hedge, remaining exposure, payment date, communication preference, and approval process. For fresh Volvo data these are **MXN 18m gross**, **0 hedged**, **MXN 18m remaining**, due **January 9, 2027**.
7. Click **Prepare tailored approach**. Read the source-grounded persona briefing before the engagement guide. Check the numerical sensitivity and distinguish documented information, suggestions, and questions to confirm.
8. Use **Edit guide** to tailor the opening, agenda, objection response, or next ask. Edits save automatically and return the guide to **Draft**. Preserve any custom wording elsewhere before refreshing: generation replaces the current guide for that client/product pair.
9. Add a review comment as needed and click **Request RM review**. In **Workspace settings**, switch to **Relationship manager**. Return through Discovery with the same FX product, open Volvo, and use **Prepared approach** to inspect the saved guide.
10. Approve the current version or **Return with comments**. A return requires a comment. If returned, revise the draft and request review again.
11. Click **Export approved guide**. The browser downloads `BNPersona-volvo-group-approved-guide.txt`, including the briefing, guide, approval metadata, and supporting source text. Nothing is emailed or sent to a client automatically.

**Expected result:** an approved plain-text guide tied to the current persona version and preparation format. The intended lifecycle is `Draft → RM review → Approved`, with `Returned → Draft` for revision. The demo UI does not require a prior RM-review request before the RM can approve; it does enforce the role and version checks used by that action.

### 2. Build persona knowledge from a note or document

**Best for:** expanding evidence before preparing a proposal. Keep source collection and review separate from guide generation.

1. Open **Data Hub**, select the client, and choose the appropriate source type. The source-type tiles select a form option; they are not live microphone or CRM integrations.
2. Try **Transcript** or **Note** to load a synthetic Volvo example, or upload a supported document. Add a clear title and a source date on or before the fixed scenario date.
3. Inspect the readable preview. Supported extensions are `.pdf`, `.docx`, `.txt`, `.md`, `.csv`, and `.json`. CSV/JSON are read as text, not mapped to a predefined database schema. Scanned PDFs need an external OCR/transcript step.
4. Click **Extract proposed updates**. Extraction creates a pending proposal; it does not immediately change verified facts. The result label identifies **Live AI** or **Demo rules**.
5. Review every proposed field against its excerpt. Edit values, deselect unsupported changes, and acknowledge conflicts with existing facts. In live extraction, separate reporting rigor, presentation format, decision criteria, and banker observations rather than reducing the whole note to a personality label.
6. Click **Approve selected updates**, or reject the proposal. A source with no extracted fields can still be approved as reviewed source knowledge. When a proposal has fields, at least one must remain selected for approval.
7. Open the updated persona. Check **Version history**, the new evidence, and the map's **NEW / UPDATED** highlights. Approval also adds the relationship to Saved Clients if it is not already saved.
8. Revisit any existing prepared approach: guides for that client are marked outdated and need refresh and renewed review.

**Expected result:** a verified source, selected facts linked to its ID, an incremented persona version, and a history snapshot. Distinct requirements with the same field key are retained when their labels differ; numeric exposure fields replace their existing values. Numeric edits cannot be negative, and hedged amount cannot exceed a known gross payable.

The built-in extractor is deliberately narrower than live semantic extraction. Do not expect the same number or granularity of proposals in both modes. Duplicate imports are detected per client by comparing whitespace-normalized source text. Approved sources appear as evidence; rejected proposals leave the verified persona unchanged.

### 3. Close the feedback loop without double-counting exposure

**Best for:** showing how a confirmed outcome changes subsequent preparation. Run after workflow 1 so there is an existing guide to invalidate.

1. Open Data Hub and click **Hedge feedback**. It loads a synthetic confirmation that Volvo has hedged **MXN 6m**, leaving **MXN 12m** of the original **MXN 18m** payable.
2. Extract proposals and verify that the **hedged amount** becomes `6000000`. Keep gross payable at `18000000`; remaining exposure must not replace gross. The payment date remains January 9, 2027.
3. Review other proposed preferences/reporting requirements and any conflicts, then approve the selected changes.
4. Check the persona: `remaining = max(0, gross − hedged) = 12000000`. Its version should increase, and the earlier guide should be outdated.
5. Return to FX Discovery, open Volvo in product context, and **Refresh guide**. Review the newly generated draft, reapply any desired custom edits, and repeat RM approval before exporting.
6. Inspect Activity for the source extraction, persona update, and subsequent preparation/review actions.

For an illustrative remaining MXN 12m payable:

| Sensitivity rate | Calculation | Rounded USD requirement |
| --- | --- | --- |
| 17 MXN per USD | `12000000 / 17` | $705,882 |
| 18 MXN per USD | `12000000 / 18` | $666,667 |
| 19 MXN per USD | `12000000 / 19` | $631,579 |

A stronger peso at 17 instead of 18 requires more USD for the same MXN obligation. These are fixed illustrative sensitivities, not forecasts or forward prices. Total payment cost remains unknown without the existing hedge's rate and terms.

### 4. Research the relationship before selecting a product

**Best for:** understanding the client without framing every fact as an immediate product opportunity.

1. Open a general persona from **Saved Clients**, Data Hub, or Portfolio Analytics.
2. In **Map**, use **Inspect branch** to focus a theme, select a node for its full text, and open its evidence from the inspector. Drag to pan, scroll or use `+`/`−` to zoom, and use **Fit map** or keyboard `0` to reset the view. Arrow keys pan when the map viewport has focus.
3. Use **Cards** for a reading-oriented overview. It has eight summary dimensions; the map has seven knowledge themes. They are separate views, not identical projections of the same tree. Treat detailed reviewed facts and original sources as the reference when summaries differ.
4. Open **Ask the persona**. Try **Quantitative data**, **Qualitative data**, **Behavioral data**, or **All three**, then ask a focused follow-up such as “Which approval limits are still unknown?”
5. Inspect cited sources and keep observations distinct from direct requests. The assistant summarizes evidence; it does not speak as the real client. Chat messages live only in the open dialog and are not saved with the persona.
6. Use **Expand this persona** to capture missing evidence. Once a product discussion is justified, select the product in Discovery and begin workflow 1.

### 5. Turn a market event into a review queue

**Best for:** identifying relationships that need attention without assuming demand or an executable recommendation.

1. Open **Market & Industry Events** and select **Peso strengthens against the US dollar**.
2. Inspect its synthetic attribution and quotation convention: `18 → 17 MXN per USD`. Add or edit context, currency/industry tags, and source attribution if needed.
3. Click **Identify affected stakeholders**. The view scrolls to the results. Inspect the mechanism summary and each client's source, remaining exposure, stakeholder, and deadline.
4. Save a relevant relationship as an event-linked opportunity. It receives **Needs confirmation** status and a note to reconfirm impact and exposure.
5. Open the persona to validate the need. Event results use their own matching rules; rerun product Discovery before preparing a product-specific approach.
6. In **Portfolio Analytics**, filter the product area, industry, evidence state, and deadline window. Drill into counts to inspect supporting records, then use Saved Clients to assign an owner and a concrete next step.

**Expected result:** a reviewable shortlist, not an automatically generated sales instruction. Event matching does not apply Discovery's product horizon, so a client can be event-affected while excluded from the current product search. Analytics currently groups primary categories into FX, trade finance, and cash management; it does not aggregate every cross-business interest into a separate chart.

## Architecture and source map

The application is a Next.js App Router shell with a client-side workspace and four server API routes. The optional catch-all page performs legacy URL canonicalization, then renders `Workspace` inside Suspense. There is no database-backed server write path.

```text
GET /api/state ── role-filtered seed ──▶ useDemoStore ◀──▶ browser localStorage
                                             │
                       ┌─────────────────────┼────────────────────┐
                       ▼                     ▼                    ▼
                Discovery/persona       Data Hub            Events/analytics
                       │                     │
                       └──── POST /api/assist ┘
                              │
                       validate + filter context
                              │
                     live provider or demo rules
                              │
                  proposals / draft text returned
                              │
                    banker review in browser
                              │
                    local update / manual export
```

| Area | Files and responsibilities |
| --- | --- |
| App entry and styling | `src/app/[[...route]]/page.tsx`, `layout.tsx`, `globals.css`: routing shell, metadata, global styles and responsive layouts. |
| Workspace shell | `src/components/workspace.tsx`: navigation, selected role, source inspection/withdrawal, settings, tour, reset, and screen composition. |
| State | `src/components/store.tsx`: hydration, local persistence, role scope, cache migration, activity recording, and reset. |
| Discovery and persona | `discovery.tsx`, `persona.tsx`, `opportunity-brief.tsx`: product selection, matches, persona details, preparation, review, and export. |
| Knowledge visualization | `persona-map.tsx`, `branch-canvas.tsx`, `src/lib/knowledge-tree.ts`: summary dimensions, seven-theme tree, radial layout, pan/zoom, collapse, focus, and inspector. |
| Capture and portfolio | `data-hub.tsx`, `events.tsx`, `portfolio.tsx`: proposals, event rules, saved opportunities, aggregate filters, and activity view. |
| Assistant presentation | `ask-persona.tsx`, `markdown-answer.tsx`, `preparation-view.tsx`: temporary Q&A, GFM rendering with raw HTML skipped, briefing and guide editing. |
| Shared UI/evidence | `ui.tsx`, `evidence-labels.tsx`, `persona-logo.tsx`, `timeline-help.tsx`: dialogs, source buttons, title lookup, branding, help, and current-time display. |
| Domain contracts | `src/lib/types.ts`: clients, sources, facts, proposals, products, matches, guides, saved items, activity, and schema-3 state. |
| Domain rules | `engine.ts`, `opportunity.ts`, `preparation.ts`: eligibility/ranking, readiness/coverage, extraction/application rules, briefing, and guide composition. `engine-client.ts` re-exports engine functions. |
| Demo data | `seed.ts`, `demo-enrichment.ts`, `products.ts`, `source-examples.ts`: 31 total role-scoped personas, scenario enrichment, 13 templates, and example notes. |
| Compatibility/helpers | `client-identities.ts`, `evidence.ts`, `evidence-labels.ts`, `timeline.ts`, `constants.ts`, `vendor.d.ts`: slug migrations, exact quote alignment, readable source names, dates, constants, and PDF-parser types. |
| Server boundaries | `src/app/api/{state,status,assist,upload}/route.ts`: seed reads, configuration reporting, assistant execution, and document-to-text conversion. |
| Tests | `tests/*.test.ts`: domain rules, migrations, enrichment, layout, opportunity logic, and calendar behavior. |

The map groups verified source-backed facts into **People & leadership**, **Business & financial position**, **Goals & opportunities**, **Reporting & decision evidence**, **Communication & engagement**, **Decision process & delivery**, and **Relationship & evidence**. `layoutKnowledge` allocates weighted angular sectors and concentric depth rings, sizes nodes from their contents, and relaxes crowded angles. It is a custom DOM/SVG layout, not a graph-database visualization. Its tests check non-overlap for an enriched tree with 60 added insights.

## Data model, persistence, and migration

| Entity | Important fields and semantics |
| --- | --- |
| `Client` | Stable company-slug `id`, primary product category, gross/hedged exposure, date offsets, `sources`, `facts`, `history`, `version`, and optional decision-process `dossier`. |
| `Source` | ID, title, type, date offset, original text, `Verified` / `Proposed` / `Withdrawn` status, reviewer, and optional restricted flag. |
| `Fact` | Typed key, human-readable label, value, source ID, optional semantic group, and `Verified` / `Disputed` / `Stale` / `Withdrawn` status. |
| `Proposal` / `Change` | Client, proposed source, selected candidate fields with excerpts, optional conflicts/groups, and generation mode. |
| `Product` | ID, category, description, benefits, intended client, constraints, currencies, and horizon. |
| `Guide` | Client/product IDs, persona version, editable text, briefing, mode, source IDs, review status/comment, timestamp, outdated flag, and `formatVersion: 2` for current preparation. |
| `Saved` | A client plus a snapshot of product parameters, owner, note, shortlist status, and optional event ID. |
| `State` | `schema: 3`, clients, current product/search state, saved items, guides, activity, events, and pending proposals. |

`GET /api/state` creates a fresh cloned seed. The browser merges a compatible cache with the currently allowed seed IDs and enrichment. Source uploads, approvals, guide edits, shortlist edits, and activity persist in browser storage, not a server database.

| Browser key | Contents |
| --- | --- |
| `bnpersona-v3-coverage` | Shared Specialist/RM state. |
| `bnpersona-v3-restricted` | Restricted-desk state. |
| `bnpersona-role` | Last selected demo role. |
| `bnpersona-ai-mode` | AI preference: `live` or `demo`. |
| `bnpersona-discovery-{role}` in session storage | Discovery search filters, sort, and excluded-results visibility for that role. |

The cache retains allowed clients and saved work while updating company names and adding seed enrichment. `client-identities.ts` maps legacy IDs such as `northstar` to `volvo-group`, redirects old routes while preserving query parameters, and migrates references in source IDs, saved items, guides, proposals, and activity. Older guide formats or incompatible calendar/profile context are flagged for refresh. This is a targeted compatibility migration, not a general database migration framework.

**Preservation limits:** clearing site data, switching origin/browser/device, or resetting the demo loses local work. There is no complete workspace backup/import interface or cross-device sync. Approved guide export is a document export, not a backup of all proposals and state. Reset clears both workspace scopes and discovery session filters but retains role and AI-mode preferences.

## Matching, evidence, and financial calculations

### Discovery eligibility and sorting

`matchClient` applies these checks in order; the first failed check supplies the exclusion reason:

1. Primary exposure evidence must be no more than 90 days old relative to the fixed scenario day.
2. No fact may be disputed or withdrawn, and the primary source must still be verified.
3. The primary category must match, or a verified fact must contain the searched product category.
4. For FX, the client must have a currency, nonzero gross exposure, a supported searched currency when specified, and positive remaining unhedged exposure.
5. A recorded deadline must exist, and its days remaining must be within `0..product.horizon` inclusive.

Remaining exposure is `max(0, (gross ?? 0) − hedged)`. Urgency is **High** at 30 days or less, **Medium** through 60 days, **Low** afterward, or **Unknown** without a date. With priority sorting, eligible matches appear first, then urgency band, readiness band, earliest deadline, and freshest primary evidence. The alternative sort orders by deadline within eligibility groups.

Product families are **FX**, **Trade finance**, **Cash management**, **Supply chain finance**, **Corporate financing**, **Debt capital markets**, **Equity capital markets**, **M&A advisory**, **Interest-rate risk**, **Commodity risk**, **Sustainable finance**, **Securities services**, and **Custom solution**. Extended-family matches are demonstrated by synthetic cross-business facts; they still use the client's recorded primary deadline. Category text matching is not a full suitability or product-eligibility engine. Free-text constraints inform guidance but are not executed as arbitrary rules. Unclear/custom descriptions may need live interpretation; the fallback recognizes a fixed set of keywords.

### Readiness, coverage, and source quality

`opportunityBrief` uses verified facts whose source is current within 90 days. Readiness is **Unknown** without current primary evidence, recorded interest, or a matching primary category. Otherwise it uses the seeded appetite and documented preference: high appetite plus preference gives High, low appetite gives Low, and the remainder gives Medium. No trained purchase probability is produced.

Persona coverage counts five areas: priority, communication preference, decision process/criteria, verified prior outcome, and reservations. Coverage is separate from exposure evidence. The internal match property `acceptance` carries this discussion-readiness value for compatibility; it should not be interpreted as purchase acceptance.

Freshness is not implemented identically in every view: the seven-theme tree filters verified facts/sources but does not impose a 90-day cutoff; Cards and the opportunity brief apply source-age checks; analytics/events use their own primary-source checks. An “evidence available” marker is not a universal approval to act.

### Updates, withdrawal, and guide validity

`applyChanges` clones the client, applies selected fields, preserves differently labeled qualitative requirements, verifies the new source, increments the persona version, and appends a fact snapshot. Changing gross, hedged, or due also updates the primary source/date. Data Hub then marks that client's guides outdated.

Withdrawing a source marks its dependent facts withdrawn, increments the persona version, appends history, and invalidates guides. It does **not** erase stored top-level amounts or recompute every summary. Inspect fact/source status and eligibility before reusing a displayed number. Discovery conservatively excludes a client with any disputed/withdrawn fact.

Guide export requires Approved status, the current persona version, no outdated flag, and preparation format 2. Editing clears recorded approval and restores Draft; refreshing generates a replacement draft. Shortlist status is a separate workflow label and never grants guide approval.

## AI configuration and execution

### Provider selection

The server chooses credentials in this order:

| Configuration | Provider/model behavior |
| --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Direct Google provider via `@ai-sdk/google`; wins when present. |
| `GEMINI_MODEL` | Direct-provider model override; default `gemini-3.5-flash-lite`. |
| `AI_GATEWAY_API_KEY` | AI Gateway credential for a compatible server environment. |
| `VERCEL_OIDC_TOKEN` or `VERCEL=1` | Enables an attempted Vercel AI Gateway path using deployment authentication. |
| `AI_GATEWAY_MODEL` | Gateway model override; default `google/gemini-3.5-flash-lite`. |

These are the defaults in this code, not a guarantee that your account has access to those models. Use a model available to the selected provider/account. `/api/status` reports configuration presence, not a successful model call. A Vercel deployment can report configured and still fall back because authentication, model access, credits, or quota is unavailable.

For local direct-provider use, create an uncommitted `.env.local`:

```dotenv
GOOGLE_GENERATIVE_AI_API_KEY=replace-with-your-key-locally
GEMINI_MODEL=gemini-3.5-flash-lite
```

Restart the local server after changing environment configuration. On Vercel, use project environment settings for the intended deployment environment and redeploy. Keep keys server-side; never prefix them with `NEXT_PUBLIC_`, commit `.env.local`, or put them in a client request. The application's Google/Gateway credentials are distinct from a Vercel management token used by deployment tooling.

### Tasks and fallback behavior

| Task | AI responsibility | Deterministic responsibility |
| --- | --- | --- |
| `interpret` | Classify a described product into a family. | Keyword classification fallback; eligibility and ordering. |
| `extract` | Propose atomic, grouped facts with exact source excerpts. | Schema validation, source-span alignment/filtering, manual selection/conflict review, and application. |
| `prepare` | Refine suggested opening, agenda, objections, questions, and next step. | Briefing structure, exposure amounts, sensitivity math, guide composition, review/export checks. |
| `ask` | Answer from supplied reviewed context with citations. | Term-matched facts/summary fallback; Markdown/evidence display. |
| `rehearse` | Generate an explicitly hypothetical response. | Source-linked rehearsal fallback. |
| `event` | Explain a potential event mechanism and internal next steps. | Identify affected clients in the browser using currency/category/industry rules. |

Live extraction normalizes typographic quotes, dashes, case, Unicode compatibility forms, and whitespace to align an excerpt to the actual source span. Unsupported paraphrases and excerpts shorter than six trimmed characters are discarded. Numeric gross/hedged/due values are converted and checked; unknown field keys can become `context`. Extraction can produce at most 40 candidate items. Banker edits and approval remain necessary; quote alignment is not proof that every proposed interpretation is correct.

AI prompts instruct the model to treat source content as untrusted, cite supplied sources, preserve unknowns, and avoid purchase claims or impersonation. Recognized source-ID citations in generated preparation/Q&A/rehearsal output are checked against allowed IDs. This is a bounded citation check, not comprehensive factual verification or a prompt-injection security guarantee.

The server uses no automatic provider retries. Timeouts are 18 seconds for interpretation, 35 for extraction, and 40 for preparation/Q&A/rehearsal/events; the assistant route declares `maxDuration = 60`. An in-memory limiter permits 24 attempted live requests per IP key per 10-minute window per instance, then returns demo rules. Provider failures also return labeled demo results with a notice. Setting `liveAI: false` bypasses provider calls entirely.

A response is labeled **Live AI** only after the provider path succeeds. Inspect each result's mode; the header's **AI configured** indicator alone does not verify live generation.

## HTTP API reference

All paths are same-origin Next.js routes. The demo has no login/session authentication; the `role` parameter is caller supplied. Treat the examples as local development operations with synthetic data.

| Endpoint | Contract |
| --- | --- |
| `GET /api/state?role=Specialist` | Returns a fresh schema-3 seed filtered to the chosen role. Exact RM/restricted role strings are recognized; other values default to Specialist. Uses `Cache-Control: no-store`. |
| `GET /api/status` | Returns `{ configured, provider, model, note }` without credential values. Uses `Cache-Control: no-store`. |
| `POST /api/assist` | JSON request; returns `{ data, mode, notice? }` on successful live or demo execution. |
| `POST /api/upload` | Multipart `file`; returns `{ text, filename, truncated }`. Converts content to text without persisting the original file on a durable backend. |

### Assistant request fields

Required fields are `task` (one of the six tasks above) and `role` (`Specialist`, `Relationship manager`, or `Restricted desk`). Optional fields depend on the task:

| Field | Limit / usage |
| --- | --- |
| `liveAI` | Set `false` for deterministic demo execution. |
| `clientId` | Up to 80 characters; required and role-allowlisted for prepare, extract, rehearse, and ask. Legacy IDs are canonicalized. |
| `client` | Schema-validated current browser client context for preparation/Q&A/rehearsal. The server does not load the browser's approved updates from a database. |
| `product` | ID ≤150, name ≤300, category 1–100, description 1–5000, benefits/ideal/constraints ≤2000 each, currencies ≤100, integer horizon 1–365. Supply all Product fields when passing it. |
| `sourceText` | Up to 25,000 characters for extraction. |
| `question` | Up to 2,000 characters. |
| `conversation` | Up to four previous `{ question, answer, mode }` messages; each answer ≤7,000 characters. The Q&A UI sends only the last four. |
| `eventText` | Up to 5,000 characters for event analysis. |

Clients supplied to the assistant are capped at 100 sources, 100 facts, and 100 history entries, with additional string limits in the route schema. The browser store itself does not enforce these same caps, so very large accumulated personas can outgrow the assistant context contract.

The assistant filters supplied sources to Verified and the selected role's scope, then keeps Verified facts linked to those sources. It validates that `client.id` matches `clientId`, but trusts caller-provided context within the schema; this is not server-authoritative banking data. Prepare requests with a supplied client/product that fails eligibility return HTTP 422.

Common assistant failures: **400** invalid JSON/schema/context, **403** client unavailable to the selected role, **413** request too large, and **422** ineligible preparation. The route checks advertised content length and decoded text length against 180,000; a successful demo fallback normally returns HTTP 200 rather than a provider error status.

Try deterministic extraction against a running local server:

```bash
curl --fail-with-body http://localhost:3000/api/assist \
  -H 'Content-Type: application/json' \
  --data '{"task":"extract","role":"Specialist","liveAI":false,"clientId":"volvo-group","sourceText":"CFO confirms MXN 6 million has now been hedged. MXN 12 million remains unhedged."}'
```

This returns proposed changes only. It does not save or approve them; those operations currently happen in the browser.

### Upload behavior

```bash
curl --fail-with-body http://localhost:3000/api/upload \
  -F 'file=@/path/to/synthetic-note.txt'
```

The file-size check rejects files larger than **8,000,000 bytes**; a separate request `Content-Length` check rejects values above 9,000,000. The response keeps at most 25,000 text characters and sets `truncated` accordingly. DOCX uses Mammoth raw-text extraction; PDF uses `pdf-parse`; text formats decode as UTF-8. No OCR, audio transcription, malware scanning, or original-file archive is implemented. Hosting limits may reject a body before these application checks run. Missing files/unsupported extensions return 400, oversized bodies/files 413, and unreadable/empty content 422. The route declares a 30-second maximum duration.

## Validation and development workflow

Run from the repository root:

```bash
npm ci
npm test
npm run build
npm run typecheck
```

Building before the standalone type check ensures that Next.js-generated route declarations referenced by `next-env.d.ts` exist on a fresh checkout. After the first build or dev startup, `npm run typecheck` can be used independently. There is no configured lint script or browser-test runner.

| Check | What it covers |
| --- | --- |
| `npm test` | Runs `tsx --test tests/*.test.ts`: 22 tests across six files at this revision. No live provider credentials required. |
| `npm run build` | Next.js production compilation, TypeScript integration, and route generation. |
| `npm run typecheck` | Strict standalone TypeScript validation without emitting application code. |
| `npm run start` | Serves the production build for functional checks. |

The test files cover engine matching and exposure updates; role seed filtering; rich enrichment and evidence labels; legacy route/cache migration; seven-theme radial layout; opportunity rationale/readiness; and calendar conversion/extraction. These are domain-level tests, not end-to-end browser coverage of every interaction, document parser, or provider.

For a focused change, run its test file, for example:

```bash
npx --no-install tsx --test tests/engine.test.ts
```

Recommended development sequence:

1. Read the relevant domain module and its tests before changing a rule. Follow `AGENTS.md`; for framework changes, consult the installed version's `node_modules/next/dist/docs/` guides.
2. Use demo mode and a known client to reproduce the current behavior without provider variability.
3. Keep source text, reviewed facts, derived summaries, and speculative suggestions distinct. Preserve both company-ID compatibility and source references when changing identity or persistence code.
4. Add or update meaningful tests for changed domain behavior, then run tests, build, and type checking.
5. Perform the relevant manual walkthrough above. Include returned/approved/outdated states when changing preparation, and conflicts/withdrawal when changing capture.
6. Inspect `git diff` for unintended lockfile, generated-file, or secret changes. Document any actual contract change in this README.

For a basic production-server check:

```bash
curl --fail-with-body http://localhost:3000/api/status
curl --fail-with-body 'http://localhost:3000/api/state?role=Specialist'
```

The status endpoint alone does not prove AI health. Exercise an assistant task and inspect `mode` when validating a live provider.

## Deployment

### Vercel

1. Import the GitHub repository into the intended Vercel project/team. Use the repository root and Next.js framework detection.
2. Select a Node.js runtime satisfying `>=22` and install from the committed lockfile. Build with `npm run build`.
3. Configure optional AI credentials/model overrides as **server-side** project environment variables. Check the selected Preview/Production environment and account/model permissions.
4. Deploy, then verify the workspace, `/api/state`, `/api/status`, a demo-mode assistant operation, and, if intended, one live operation.
5. Follow the discovery-to-export and feedback walkthroughs in the deployment's browser origin. Existing local-development storage does not automatically transfer to the deployed origin.
6. After changing code or hosted variables, build/redeploy and repeat affected checks. Do not assume a configured status means provider authorization succeeded.

`.vercelignore` excludes local environment files, `.vercel`, dependencies/build output, tests, scripts, and TypeScript build-info files from applicable uploads. `.gitignore` excludes dependencies, `.next`, `.vercel`, `.env*` except a potential `.env.example`, build-info, and test results. No `.env.example`, deployment-specific `vercel.json`, or CI workflow is currently included.

### Other Node.js hosting

Install dependencies, build, and run `npm run start` behind the host's routing/TLS layer. Supply the same optional server variables and account permissions. Serverless/in-memory state is limited to throttling; persona persistence remains in each browser.

`next.config.ts` disables the powered-by header and dev indicators and adds `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`, and `X-Frame-Options: DENY`. These headers do not provide user authentication or make the prototype production-ready.

## Troubleshooting

| Symptom | Diagnosis and next step |
| --- | --- |
| A different computer/browser has no saved clients | State is local to the original browser and origin. Deployment/Git source recovery does not recover that browser's workspace. |
| The header says AI configured but results say Demo rules | Check the response notice and server logs, model access, credentials, quota/credits, and whether the live toggle is enabled. Configured status is a presence check. |
| Direct Gemini fails while a Gateway credential is available | A direct Google key takes precedence. Correct/remove that configuration if Gateway is intended, then restart/redeploy. |
| Custom product wording cannot be interpreted | Use a supported family/template or clearer description. Fallback keyword rules cannot classify every custom product. |
| No clients are matched | Inspect excluded reasons, currencies, horizon, primary source age/status, disputed/withdrawn facts, remaining FX amount, and deadline. Clear text/interest filters. |
| Preparation controls are absent | You opened the general persona. Select the product in Discovery and open the client from results. |
| A deep link shows an unexpected product | Product parameters come from browser state. Select the intended product through Discovery again; the query ID alone does not restore its parameters. |
| Guide review/export is blocked | Refresh outdated/old-format guides, check persona version, switch to RM for approval, and approve again after edits. Shortlist Approved status does not approve the guide. |
| Refresh removed custom guide wording | Refresh replaces the current client/product guide. Retain important edits before regenerating, then reapply and request review. |
| PDF upload has no readable text | Scans/images need OCR outside the app. Paste a transcript or upload a readable text export. |
| Large upload/context fails | Keep files ≤8,000,000 bytes, inspect truncation at 25,000 characters, and check host limits. Large personas may exceed the assistant's request or 100-item context caps. |
| An import is rejected as a duplicate | The same whitespace-normalized source text is already attached to that client. Inspect the existing source rather than reimporting it. |
| Amount changes are rejected | Check nonnegative values and ensure hedged does not exceed gross. Preserve gross when updating remaining exposure. |
| New requirements appear in the map but not a Cards summary | The tree and Cards have separate derivation logic; Cards are a summary. Verify detailed facts and source text. |
| Local storage is full | Export required approved documents and preserve any other needed local work before reset. The app has no full-workspace backup UI. |
| Type checking cannot find `.next/types` declarations | Run the initial Next.js build or dev startup to generate the route declarations. |
| Port 3000 is already in use | Choose `--port 3001` for the relevant dev/start command; do not stop an unrelated process. |

## Prototype boundaries

This repository demonstrates **Capture → Connect → Prepare → Learn** with explainable prioritization. It does not include trained purchase-probability scoring, revenue optimization, real financial feeds, automatic outreach, trade execution, or a real CRM connector.

Before using real banking/client information, a separate production implementation would need authenticated identities, server-enforced entitlements and information barriers, server-authoritative and durable records, controlled CRM writes, secure uploads and retention, model/data-use approval, monitoring, and a global abuse-control layer. Current roles and API client allowlists illustrate the workflow but accept user-selected roles and supplied client context. Browser review status and activity are editable local state, not tamper-proof approvals or audit evidence.

The synthetic enrichment includes fictional regional-unit revenue histories, liquidity/profitability assumptions, stakeholders, implementation plans, and chart preferences. The 2026 revenue value is a planning estimate, not a closed-year actual. The app does not fetch competitor statements or generate a verified financial-analysis report simply because a client requested one.

## License and assets

Application code is covered by the [MIT License](LICENSE), copyright 2026 Matthew Ding. BNP Paribas branding is a separate third-party asset; see [public/brand-source.txt](public/brand-source.txt) for its source attribution. The prototype does not establish endorsement or approval by BNP Paribas or other referenced organizations.
