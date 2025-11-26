# Tender Management UI/UX Flow (Phases 1-4)

Textual flow chart covering navigation, listing logic, creation, and provider invitation states. Static spec only (no runtime logic).

## Legend
- [B] Buyer role only
- [S] Seller role only
- States: DRAFT → STARTED → LAUNCHED → CLOSED/ASSIGNED
- Actions greyed/disabled once taken (seller responses) or when tender is closed/assigned.

## Core Navigation (Phase 1)
User menu (Buyer/Seller visible) → click “Tender Management” → open Dashboard
Sidebar: Dashboard | New Tender

## Dashboard Listing (Phase 2)
- Branch by role:
  - [B] Show tenders created by buyer.
  - [S] Show tenders where seller is invited; exclude DRAFT.
- Table columns: TenderID | Name | Creation Date | Acceptance Deadline | Offering Deadline | Status | Participants total(acc/decl) | Actions (tooltip on each).

### Buyer Actions (per row)
- Tender details (view)
- Status management (transition)
- Chat

### Seller Actions (per row, status-driven)
- STARTED: Download brief | Participate | Decline
  - After Participate or Decline → all seller actions disabled for that tender.
- LAUNCHED: Download | Upload proposal | Chat
- Actions hidden once tender is CLOSED or ASSIGNED.

## New Tender Flow (Phase 3) [B]
Entry: Sidebar → “New Tender”
- Tabs: General description (enabled) | Participants (disabled until save)
- Single form, save only once; initial Status = DRAFT.
- Fields: Auto-ID (generated), Name, Acceptance deadline, Offering deadline, General description, Attachment (PDF).
- Save behavior: Save → stay on page (participants tab unlocks). Back → return Dashboard without save.

### Validation to move DRAFT → STARTED
- Auto-ID present
- Name provided
- Valid dates (acceptance <= offering)
- Attachment uploaded
- ≥1 provider selected

## Provider Invitation UI (Phase 4)
Tabs: Selected Providers | Add new provider

### Selected Providers table
- Columns: Provider name | Invitation date | Acceptance | Proposal file/date | Proposal status
- Actions:
  - Remove provider (only when tender is DRAFT)
  - Accept/Refuse proposal (only when tender is LAUNCHED)

### Add New Provider (search and select)
- Filters (AND across groups, OR within each group): Name, Country, Service Type, Market, Category, Compliance, Certs
- Results: Show count, display top 5; checkbox selection; name links to profile popup
- Save selection: prevents duplicates; Back returns to Selected Providers tab

## End-to-end Scenario Paths
1) Buyer creates tender → fills General tab → saves (stays) → Participants tab unlocks → selects providers → meets validation → sets STARTED → sellers see it.
2) Seller on STARTED tender → Download → Participate OR Decline → actions disabled; still listed until CLOSED/ASSIGNED.
3) Seller on LAUNCHED tender → Download → Upload proposal → Chat; remains visible until CLOSED/ASSIGNED.
4) Buyer updates status (status management) → can LAUNCH → sellers get LAUNCHED actions; eventually CLOSE/ASSIGN hides seller actions.
