export interface Tender {
  id?: string;
  category: 'coordinator' | 'tendering';
  state: 'draft' | 'started' | 'launched' | 'closed' | 'assigned' | 'pre-launched' | 'pending' | 'sent';
  tenderName?: string;
  tenderCode?: string;
  responseDeadline: string;
  acceptanceDeadline?: string;
  offeringDeadline?: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders: string[];
  external_id?: string;  // ID del tender parent (per tender figli)
  provider?: string;      // Nome del provider (per tender figli)
  createdAt?: string;
  updatedAt?: string;
  participantsSummary?: TenderParticipantsSummary;
  
  // Completion dates from Quote
  expectedQuoteCompletionDate?: string;
  requestedQuoteCompletionDate?: string;
  effectiveQuoteCompletionDate?: string;
  expectedFulfillmentStartDate?: string;
}

export interface TenderParticipantsSummary {
  invited: number;
  accepted: number;
  rejected: number;
}

export interface TenderAttachment {
  name: string;
  mimeType: string;
  content: string; // Base64 encoded content
  size?: number;
}

export interface Tender_Create {
  category: 'coordinator' | 'tendering';
  state: 'draft' | 'started' | 'launched' | 'closed' | 'assigned' | 'pre-launched' | 'pending' | 'sent';
  tenderName?: string;
  tenderCode?: string;
  responseDeadline: string;
  acceptanceDeadline?: string;
  offeringDeadline?: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders: string[];
  external_id?: string;
  provider?: string;
  participantsSummary?: TenderParticipantsSummary;
}

export interface Tender_Update {
  responseDeadline?: string;
  tenderName?: string;
  tenderCode?: string;
  acceptanceDeadline?: string;
  offeringDeadline?: string;
  participantsSummary?: TenderParticipantsSummary;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders?: string[];
  state?: 'draft' | 'started' | 'launched' | 'closed' | 'assigned' | 'pre-launched' | 'pending' | 'sent';
  external_id?: string;
  provider?: string;
}
