# TODO: Provider Notification System

## Priority: Medium
## Status: Pending Implementation

### Description
When a tender is finalized (coordinator quote status updated to "inProgress"), the system needs to send notifications to all invited providers to inform them about the new tender opportunity.

### Current Implementation
Currently, when the "Complete Tender" button is clicked:
1. A success message is shown: "Notification has been sent to the providers"
2. **BUT** no actual notifications are sent yet (this is a placeholder)

### Required Implementation

#### 1. Notification Service
Create or extend a notification service that can:
- Send email notifications
- Send in-app notifications
- Track notification status (sent, delivered, read)

#### 2. Email Template
Design an email template for provider tender notifications that includes:
- Tender title/description
- Coordinator information
- Expected and requested completion dates
- Link to view tender details in the portal
- Call-to-action button

#### 3. API Integration
Integrate with email service provider (e.g., SendGrid, AWS SES, etc.) to:
- Send bulk emails to multiple providers
- Handle email delivery failures
- Track email open rates (optional)

#### 4. Provider Portal Notifications
- Add in-app notification badge/icon in provider navigation
- Create notifications list page
- Mark notifications as read/unread

#### 5. Backend Changes (if needed)
- May need to add notification endpoints to the backend
- Store notification history in database
- Track which providers have been notified about which tenders

### Files Affected
- `src/app/features/providers/pages/provider-list/provider-list.component.ts` (line 1184)
  - Method: `finalizeTender()`
  - Location: After coordinator quote status update

### Testing Requirements
- Test email delivery to multiple providers
- Test notification content and formatting
- Test edge cases (invalid emails, provider opt-out, etc.)
- Test notification history and tracking

### Estimated Effort
- 2-3 days for basic email implementation
- 1-2 days for in-app notifications
- 1 day for testing and refinement

### Dependencies
- Email service provider account/credentials
- Email templates design
- Backend API for notification tracking (if not exists)

