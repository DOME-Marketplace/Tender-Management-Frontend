# Tender Management – User Role Journey (Non-technical)

Mermaid flow focused on what a user sees based on role choice.

```mermaid
flowchart TD
    A[Login page] --> B{Choose role}
    B -->|Buyer| C[Home shows Providers list]
    B -->|Seller| D[Home shows Providers list]

    %% Common nav
    C --> E{Pick destination}
    D --> E
    E -->|Providers| F[Browse providers]
    E -->|Tender Dashboard| G[Tender dashboard]

    %% Buyer view on dashboard
    G --> H{Role = Buyer?}
    H -->|Yes| I[See tenders I created]
    I --> J[Actions: Details, Status, Chat]
    H -->|No (Seller)| K[See tenders I am invited to (no Drafts)]
    K --> L{Status}
    L -->|STARTED| M[Actions: Download, Participate, Decline]
    L -->|LAUNCHED| N[Actions: Download, Upload, Chat]

    %% Creation path
    I --> O[New Tender (Buyer only)]
    O --> P[Fill General tab, Save draft]
    P --> Q[Participants tab unlocks]
    Q --> R[Select providers, meet rules -> Start tender]
```

How to read:
- Both buyers and sellers land after login; navigation lets them open Providers or the Tender Dashboard.
- Buyers see only tenders they created; sellers see only tenders they were invited to (Drafts hidden).
- Buyer actions: Details, Status management, Chat.
- Seller actions depend on status: STARTED (Download/Participate/Decline), LAUNCHED (Download/Upload/Chat).
- Buyers can create a new tender: save draft, then unlock participants, then start it.
