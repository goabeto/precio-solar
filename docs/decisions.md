# Strategic Decisions — Precio Solar

Record of decisions taken in the 2026-04-21 session (task 005 in mini-team).

## 1. Lead routing

All lead notifications go to **`leads@goabeto.com`**.

- Calculator phone entry → email notification
- End-of-funnel qualification → full HTML report email
- Same mailbox for both (simplifies ops)

## 2. WhatsApp integration

**Skip for now.** Future task. Until then, notifications are email-only.

## 3. ElevenLabs AI voice chat

**Park.** Code in `src/components/AIChatWidget.tsx` stays; widget hidden via feature flag until we have paying partners to justify the API cost. Qualification form already captures the essential signal.

## 4. Domain

**`preciosolar.com`** (not `.es`). Not yet purchased. GoDaddy access for the existing `goabeto.com` is also blocked — same owner needs to be identified for both.

## 5. First-10-leads workflow

**Semi-auto.** Lead drops in email → system auto-forwards to the 3 matched partner installers via `selected_installers`. Nuno only intervenes on exceptions, not on every lead.

This puts extra weight on decision 8 — partner installers **must** surface as the top recommendation with defensible justification.

### Partner regional coverage

| Partner | Regions |
|---|---|
| **Xolary** | Madrid, Toledo, Segovia, Ávila, Guadalajara |
| **ESR** | All provinces in Cataluña + Comunidad Valenciana |
| **SotySolar** | All other regions of Spain (fallback) |

## 6. Phone capture UX

**Remove upfront phone gate from the calculator.** Capture phone at the **value moment** in every funnel — after the user sees something valuable, not before.

- **Calculator funnel** → capture at LeadForm step (after results shown)
- **Loan comparison (`/comparar-financiacion`)** → capture before revealing full TAE/monthly breakdown or when user goes to contact a lender
- **Proposal review (`/revisar-propuesta`)** → capture before revealing the price-score / subsidy-gap analysis

### Ancillary decision: remove pre-generated message drafts

The current QualificationForm generates editable messages to each selected installer. Remove that step. Goal: keep the user moving fast through screens, nudge toward partners, collect contact only at the final step. The partner receives the lead + context via our auto-forwarded email, not via a user-drafted message.

## 7. Monetization

**Charge from lead #1.** No free grace period. Revenue model: **commission on installation** (% of contract value, per existing partner agreements with Xolary, ESR, SotySolar).

Operational implication: no billing infra needed at launch, but we need a lightweight monthly reconciliation loop where partners report closed deals against leads we forwarded. Trust-based for now. Flag for a later task (~Q3).

## 8. "Top Pick" positioning

### 8a. Badge

**"Clientes recomiendan"** (final wording — something along these lines, in that social-proof register). Rendered in the Top Pick card, visually distinct from alternatives.

### 8b. Transparency

Always show **≥ 3 alternative installers** below the Top Pick, with slightly *worse* Google ratings than the partner so the Top Pick looks earned. Link to [tuenergiaverde.es](https://tuenergiaverde.es) for the full directory stays — regulatory safety + user trust.

### 8c. Quotes source

**Manual curation.** Nuno hand-picks 2 Google review quotes per partner (6 total). Hardcoded in `src/lib/data.ts` alongside partner metadata. Upgrade to Google Places API later if quote freshness becomes an issue.

**Action item**: Nuno provides 2 quotes per partner before the partner-priority feature ships.

## 9. Data model

**Settled via migration `20260410_create_solar_journey_tables.sql`** (applied to Supabase project `craacmypyqvxqqdssivc` on 2026-04-20). Five tables: `solar_journey_leads`, `solar_journey_cases`, `solar_journey_proposals`, `solar_journey_chats`, `solar_journey_messages`. Storage bucket `proposal-uploads` in place (10 MB, PDF/PNG/JPG/WebP).

## 10. Content strategy

### 10a. Posture

**Moderate.** One post per week via the sibling `solar-pipeline` project, focused on high-intent queries:
- "cuánto cuestan las placas solares 2026"
- "subvención solar [region]"
- "comparar préstamos placas solares"
- City long-tail: "precio placas solares [city]"

### 10b. Lead magnet posture

**Pure trust play.** PDF downloads (e.g. "Guía de subvenciones 2026") do **not** gate behind a phone/email capture. Content builds brand; funnel captures leads. Don't mix the two — dilutes both.

## Follow-on tasks spawned by these decisions

1. **Implement partner-priority installer selection** — hard-code regional mapping + badge + 6 Google review quotes (pending from Nuno) + ensure 3 alternative installers with slightly worse ratings surface below.
2. **Remove pre-generated message-draft UX** from QualificationForm + equivalent steps in the other two funnels.
3. **Redistribute phone capture** across calculator / loan comparison / proposal review funnels to the value moment in each.
4. **Gate ElevenLabs widget behind a feature flag** (`NEXT_PUBLIC_ELEVENLABS_ENABLED`).
5. **Commission reconciliation loop** with partners — monthly reporting + lead-to-install attribution (Q3 task, low priority).
