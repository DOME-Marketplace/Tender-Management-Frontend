import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Tender, Tender_Create, Tender_Update } from '../../shared/models/tender.model';
import { Quote, QuoteStateType } from '../../shared/models/quote.model';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

/**
 * TenderService - Manages tender/quote operations
 * 
 * Note: The backend uses "Quote" terminology but the frontend uses "Tender" terminology.
 * This service handles the mapping between the two:
 * - Frontend Tender category 'coordinator' → Backend Quote category 'coordinator'
 * - Frontend Tender category 'tendering' → Backend Quote category 'tender'
 */
@Injectable({
  providedIn: 'root'
})
export class TenderService extends ApiService {
  
  constructor(protected override http: HttpClient) {
    super(http);
  }

  // ========================================
  // CREATE OPERATIONS
  // ========================================

  /**
   * Create a coordinator tender (for managing tendering processes)
   * POST /quoteManagement/tendering/createCoordinatorQuote
   */
  createCoordinatorTender(customerIdRef: string, customerMessage: string): Observable<Tender> {
    const payload = {
      customerMessage,
      customerIdRef
    };
    
    return this.post<Quote>('/tendering/createCoordinatorQuote', payload).pipe(
      map(quote => this.mapQuoteToTender(quote))
    );
  }

  /**
   * Create a tendering quote (child tender for specific provider)
   * POST /quoteManagement/tendering/createQuote
   */
  createTenderingQuote(
    customerIdRef: string, 
    providerIdRef: string, 
    externalId: string,
    customerMessage?: string
  ): Observable<Tender> {
    const payload = {
      customerMessage: customerMessage || '',
      customerIdRef,
      providerIdRef,
      externalId
    };
    
    return this.post<Quote>('/tendering/createQuote', payload).pipe(
      map(quote => this.mapQuoteToTender(quote))
    );
  }

  /**
   * Create multiple tendering quotes for multiple providers
   */
  createMultipleTenderingQuotes(
    customerIdRef: string,
    providerIds: string[],
    externalId: string,
    customerMessage?: string
  ): Observable<Tender[]> {
    const requests = providerIds.map(providerId => 
      this.createTenderingQuote(customerIdRef, providerId, externalId, customerMessage)
    );
    
    // Execute all requests in parallel
    return new Observable(observer => {
      Promise.all(requests.map(req => req.toPromise()))
        .then(tenders => observer.next(tenders.filter(t => t !== undefined) as Tender[]))
        .catch(error => observer.error(error));
    });
  }

  /**
   * Legacy method - kept for backward compatibility
   * Creates a tender (maps to coordinator quote)
   */
  createTender(tenderData: Tender_Create): Observable<Tender> {
    // For now, just create a coordinator quote
    // In a real implementation, this would need more logic
    return this.createCoordinatorTender(
      'user-id', // TODO: Get from auth service
      tenderData.tenderNote || ''
    );
  }

  /**
   * Legacy method - kept for backward compatibility
   */
  createMultipleTenders(tendersData: Tender_Create[]): Observable<Tender[]> {
    // This needs to be updated based on your actual flow
    console.warn('createMultipleTenders: This method needs to be updated for API integration');
    return new Observable(observer => {
      observer.next([]);
    });
  }

  // ========================================
  // READ OPERATIONS
  // ========================================

  /**
   * Get all quotes/tenders
   * GET /quoteManagement/listAllQuotes
   */
  getAllTenders(): Observable<Tender[]> {
    return this.get<Quote[]>('/listAllQuotes').pipe(
      map(quotes => quotes.map(quote => this.mapQuoteToTender(quote)))
    );
  }

  /**
   * Get tenders (legacy method name)
   */
  getTenders(): Observable<Tender[]> {
    return this.getAllTenders();
  }

  /**
   * Get tender by ID
   * GET /quoteManagement/quoteById/{id}
   */
  getTenderById(id: string): Observable<Tender> {
    const encodedId = encodeURIComponent(id);
    return this.get<Quote>(`/quoteById/${encodedId}`).pipe(
      map(quote => this.mapQuoteToTender(quote))
    );
  }

  /**
   * Get raw Quote by ID (without mapping to Tender)
   * GET /quoteManagement/quoteById/{id}
   */
  getQuoteById(id: string): Observable<Quote> {
    const encodedId = encodeURIComponent(id);
    return this.get<Quote>(`/quoteById/${encodedId}`);
  }

  /**
   * Get coordinator tenders for a user
   * GET /quoteManagement/tendering/coordinatorQuotes/{userId}
   */
  getCoordinatorTendersByUser(userId: string): Observable<Tender[]> {
    const encodedUserId = encodeURIComponent(userId);
    return this.get<Quote[]>(`/tendering/coordinatorQuotes/${encodedUserId}`).pipe(
      map(quotes => quotes.map(quote => this.mapQuoteToTender(quote)))
    );
  }

  /**
   * Get coordinator quotes (raw Quote[])
   */
  getCoordinatorQuotesRaw(userId: string): Observable<Quote[]> {
    const encodedUserId = encodeURIComponent(userId);
    return this.get<Quote[]>(`/tendering/coordinatorQuotes/${encodedUserId}`);
  }

  /**
   * Get tendering quotes for a user by external ID (optional)
   * GET /quoteManagement/tendering/quotes/{userId}?role={role}&externalId={externalId}
   */
  getTenderingQuotesByUser(
    userId: string, 
    role: 'Customer' | 'Seller' = 'Seller',
    externalId?: string
  ): Observable<Tender[]> {
    const encodedUserId = encodeURIComponent(userId);
    let params = new HttpParams().set('role', role);
    
    if (externalId) {
      params = params.set('externalId', externalId);
    }
    
    return this.get<Quote[]>(
      `/tendering/quotes/${encodedUserId}`,
      params
    ).pipe(
      map(quotes => quotes.map(quote => this.mapQuoteToTender(quote)))
    );
  }

  /**
   * Get tendering quotes (raw Quote[])
   */
  getTenderingQuotesRaw(
    userId: string,
    role: 'Customer' | 'Seller' = 'Seller',
    externalId?: string
  ): Observable<Quote[]> {
    const encodedUserId = encodeURIComponent(userId);
    let params = new HttpParams().set('role', role);
    if (externalId) params = params.set('externalId', externalId);
    return this.get<Quote[]>(`/tendering/quotes/${encodedUserId}`, params);
  }

  /**
   * Get tailored quotes by user with role filtering (non-tendering)
   * GET /quoteManagement/quoteByUser/{userId}?role={role}
   */
  getQuotesByUser(userId: string, role: 'Customer' | 'Seller'): Observable<Tender[]> {
    const encodedUserId = encodeURIComponent(userId);
    let params = new HttpParams().set('role', role);
    
    return this.get<Quote[]>(
      `/quoteByUser/${encodedUserId}`,
      params
    ).pipe(
      map(quotes => quotes.map(quote => this.mapQuoteToTender(quote)))
    );
  }

  /**
   * Legacy method - filter tenders by external ID (client-side)
   */
  getTendersByExternalId(externalId: string): Observable<Tender[]> {
    return this.getAllTenders().pipe(
      map(tenders => tenders.filter(t => t.external_id === externalId))
    );
  }

  // ========================================
  // UPDATE OPERATIONS
  // ========================================

  /**
   * Update tender status
   * PATCH /quoteManagement/updateQuoteStatus/{id}?statusValue={status}
   */
  updateTenderStatus(id: string, status: string): Observable<Tender> {
    const encodedId = encodeURIComponent(id);
    let params = new HttpParams().set('statusValue', status);
    
    return this.patch<Quote>(
      `/updateQuoteStatus/${encodedId}`,
      null,
      params
    ).pipe(
      map(quote => this.mapQuoteToTender(quote))
    );
  }

  /**
   * Update tender (generic update)
   * Note: This is a simplified version. For specific updates, use dedicated methods.
   */
  updateTender(id: string, updates: Tender_Update): Observable<Tender> {
    // For state updates, use the status endpoint
    if (updates.state) {
      return this.updateTenderStatus(id, updates.state);
    }
    
    // For other updates, we might need to add notes or attachments
    console.warn('updateTender: Generic updates not fully implemented. Use specific methods.');
    return this.getTenderById(id); // Return unchanged for now
  }

  /**
   * Add note to tender
   * PATCH /quoteManagement/addNoteToQuote/{id}?userId={userId}&messageContent={messageContent}
   */
  addNoteToTender(id: string, userId: string, messageContent: string): Observable<Tender> {
    const encodedId = encodeURIComponent(id);
    let params = new HttpParams()
      .set('userId', userId)
      .set('messageContent', messageContent);
    
    return this.patch<Quote>(
      `/addNoteToQuote/${encodedId}`,
      null,
      params
    ).pipe(
      map(quote => this.mapQuoteToTender(quote))
    );
  }

  /**
   * Add note to quote (raw Quote object, for modals)
   * PATCH /quoteManagement/addNoteToQuote/{id}?userId={userId}&messageContent={messageContent}
   */
  addNoteToQuote(id: string, messageContent: string, userId: string): Observable<Quote> {
    const encodedId = encodeURIComponent(id);
    let params = new HttpParams()
      .set('userId', userId)
      .set('messageContent', messageContent);
    
    return this.patch<Quote>(
      `/addNoteToQuote/${encodedId}`,
      null,
      params
    );
  }

  /**
   * Add attachment to tender
   * PATCH /quoteManagement/addAttachmentToQuote/{id}
   */
  addAttachmentToTender(id: string, file: File, description?: string): Observable<Tender> {
    const encodedId = encodeURIComponent(id);
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    return this.patch<Quote>(
      `/addAttachmentToQuote/${encodedId}`,
      formData
    ).pipe(
      map(quote => this.mapQuoteToTender(quote))
    );
  }

  /**
   * Add attachment to quote (raw Quote object, for modals)
   * PATCH /quoteManagement/addAttachmentToQuote/{id}
   */
  addAttachmentToQuote(id: string, file: File, description?: string): Observable<Quote> {
    const encodedId = encodeURIComponent(id);
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    return this.patch<Quote>(
      `/addAttachmentToQuote/${encodedId}`,
      formData
    );
  }

  /**
   * Update tender date
   * PATCH /quoteManagement/updateQuoteDate/{id}?date={date}&dateType={dateType}
   */
  updateTenderDate(id: string, date: string, dateType: 'expectedFulfillment' | 'effective'): Observable<Tender> {
    const encodedId = encodeURIComponent(id);
    let params = new HttpParams()
      .set('date', date)
      .set('dateType', dateType);
    
    return this.patch<Quote>(
      `/updateQuoteDate/${encodedId}`,
      null,
      params
    ).pipe(
      map(quote => this.mapQuoteToTender(quote))
    );
  }

  // ========================================
  // DELETE OPERATIONS
  // ========================================

  /**
   * Delete tender
   * DELETE /quoteManagement/quote/{id}
   */
  deleteTender(id: string): Observable<void> {
    const encodedId = encodeURIComponent(id);
    return this.delete<void>(`/quote/${encodedId}`);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Convert File to base64 string
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Download attachment from tender
   */
  downloadAttachment(tenderOrQuote: Tender | Quote): void {
    // Handle both Tender and Quote types
    let attachment: any = null;
    
    if ('attachment' in tenderOrQuote && tenderOrQuote.attachment) {
      // It's a Tender
      attachment = tenderOrQuote.attachment;
    } else if ('quoteItem' in tenderOrQuote && tenderOrQuote.quoteItem && tenderOrQuote.quoteItem.length > 0) {
      // It's a Quote
      const firstItem = tenderOrQuote.quoteItem[0];
      if (firstItem.attachment && firstItem.attachment.length > 0) {
        attachment = firstItem.attachment[0];
      }
    }

    if (!attachment) {
      throw new Error('No attachment found');
    }

    const byteCharacters = atob(attachment.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: attachment.mimeType || 'application/pdf' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.name || 'attachment.pdf';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ========================================
  // QUOTE-SPECIFIC METHODS (for legacy components)
  // ========================================

  /**
   * Update quote status (returns raw Quote object)
   * PATCH /quoteManagement/updateQuoteStatus/{id}?statusValue={status}
   */
  updateQuoteStatus(id: string, status: string): Observable<Quote> {
    const encodedId = encodeURIComponent(id);
    let params = new HttpParams().set('statusValue', status);
    
    return this.patch<Quote>(
      `/updateQuoteStatus/${encodedId}`,
      null,
      params
    );
  }

  /**
   * Update quote state (alias for updateQuoteStatus)
   */
  updateQuoteState(id: string, state: QuoteStateType): Observable<Quote> {
    return this.updateQuoteStatus(id, state);
  }

  /**
   * Update quote date (returns raw Quote object)
   * PATCH /quoteManagement/updateQuoteDate/{id}?date={date}&dateType={dateType}
   */
  updateQuoteDate(id: string, date: string, dateType: 'effective' | 'expectedFulfillment'): Observable<Quote> {
    const encodedId = encodeURIComponent(id);
    let params = new HttpParams()
      .set('date', date)
      .set('dateType', dateType);
    
    return this.patch<Quote>(
      `/updateQuoteDate/${encodedId}`,
      null,
      params
    );
  }

  /**
   * Delete quote
   * DELETE /quoteManagement/quote/{id}
   */
  deleteQuote(id: string): Observable<void> {
    return this.deleteTender(id);
  }

  // ========================================
  // MAPPING METHODS
  // ========================================

  /**
   * Map backend Quote to frontend Tender model
   */
  private mapQuoteToTender(quote: Quote): Tender {
    // Extract response deadline from quote
    const responseDeadline = quote.expectedFulfillmentStartDate || 
                            quote.effectiveQuoteCompletionDate || 
                            new Date().toISOString();

    // Extract tender title from quote.description (this is where the title is saved)
    const tenderNote = quote.description || undefined;

    // Extract attachment from quote items
    let attachment = undefined;
    if (quote.quoteItem && quote.quoteItem.length > 0) {
      const firstItem = quote.quoteItem[0];
      if (firstItem.attachment && firstItem.attachment.length > 0) {
        const att = firstItem.attachment[0];
        attachment = {
          name: att.name || 'attachment.pdf',
          mimeType: att.mimeType || 'application/pdf',
          content: att.content || '',
          size: att.size?.amount
        };
      }
    }

    // Extract selected providers from related parties
    const selectedProviders = quote.relatedParty
      ?.filter(party => party.role?.toLowerCase() === 'seller')
      .map(party => party.id) || [];

    // Map quote category to tender category
    let category: 'coordinator' | 'tendering' = 'coordinator';
    if (quote.category === 'tender') {
      category = 'tendering';
    } else if (quote.category === 'coordinator') {
      category = 'coordinator';
    }

    // Map quote state to tender state
    let state: 'draft' | 'pre-launched' | 'pending' | 'sent' | 'closed' = 'draft';
    if (quote.state === 'inProgress') state = 'draft';
    else if (quote.state === 'pending') state = 'pending';
    else if (quote.state === 'approved') state = 'sent';
    else if (quote.state === 'accepted') state = 'closed';
    else if (quote.state === 'cancelled') state = 'closed';
    else if (quote.state === 'rejected') state = 'closed';

    // Extract external_id and provider from quote
    const external_id = quote.externalId;
    const provider = quote.relatedParty
      ?.find(party => party.role?.toLowerCase() === 'seller')
      ?.name;

    return {
      id: quote.id,
      category,
      state,
      responseDeadline,
      tenderNote,
      attachment,
      selectedProviders,
      external_id,
      provider,
      createdAt: quote.quoteDate,
      updatedAt: quote.quoteDate,
      effectiveQuoteCompletionDate: quote.effectiveQuoteCompletionDate,
      expectedFulfillmentStartDate: quote.expectedFulfillmentStartDate
    };
  }

  /**
   * Map frontend Tender to backend Quote payload
   */
  private mapTenderToQuotePayload(tender: Tender_Create): any {
    // This would be used for creating quotes
    // Implementation depends on exact requirements
    return {
      category: tender.category === 'tendering' ? 'tender' : tender.category,
      // ... other mappings
    };
  }
}
