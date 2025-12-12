export type TenderStatus = 'draft' | 'started' | 'launched' | 'closed' | 'assigned';

export interface TenderStatusMetadata {
  status: TenderStatus;
  acceptanceDeadline?: string;
  offeringDeadline?: string;
}

export interface TenderStatusTransition {
  from: TenderStatus;
  to: TenderStatus;
  allowed: boolean;
  reason?: string;
}
