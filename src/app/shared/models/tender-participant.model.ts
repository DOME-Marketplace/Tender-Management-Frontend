export interface TenderParticipant {
  providerId: string;
  providerName: string;
  invitationDate?: string;
  acceptanceStatus: 'pending' | 'accepted' | 'refused';
  hasProposal?: boolean;
  proposalDate?: string;
  proposalStatus?: 'none' | 'to-be-evaluated' | 'accepted' | 'refused';
  quoteId?: string;
  tenderId?: string;
}
