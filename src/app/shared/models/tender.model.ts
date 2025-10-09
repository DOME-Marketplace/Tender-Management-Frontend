export interface Tender {
  id?: string;
  category: 'coordinator';
  state: 'draft' | 'sent' | 'closed';
  responseDeadline: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TenderAttachment {
  name: string;
  mimeType: string;
  content: string; // Base64 encoded content
  size?: number;
}

export interface Tender_Create {
  category: 'coordinator';
  state: 'draft' | 'sent' | 'closed';
  responseDeadline: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders: string[];
}

export interface Tender_Update {
  responseDeadline?: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders?: string[];
  state?: 'draft' | 'sent' | 'closed';
}

