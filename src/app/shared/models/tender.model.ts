export interface Tender {
  id?: string;
  category: 'coordinator' | 'tendering';
  state: 'draft' | 'pre-launched' | 'pending' | 'sent' | 'closed';
  responseDeadline: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders: string[];
  external_id?: string;  // ID del tender parent (per tender figli)
  provider?: string;      // Nome del provider (per tender figli)
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
  category: 'coordinator' | 'tendering';
  state: 'draft' | 'pre-launched' | 'pending' | 'sent' | 'closed';
  responseDeadline: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders: string[];
  external_id?: string;
  provider?: string;
}

export interface Tender_Update {
  responseDeadline?: string;
  tenderNote?: string;
  attachment?: TenderAttachment;
  selectedProviders?: string[];
  state?: 'draft' | 'pre-launched' | 'pending' | 'sent' | 'closed';
  external_id?: string;
  provider?: string;
}

