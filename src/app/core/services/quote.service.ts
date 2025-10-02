import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quote } from '../../shared/models/quote.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class QuoteService extends ApiService {
  protected readonly endpoint = 'quotes';

  constructor(protected override http: HttpClient) {
    super(http);
  }

  getQuotes(): Observable<Quote[]> {
    return this.get<Quote[]>('');
  }

  getQuoteById(id: string): Observable<Quote> {
    return this.get<Quote>(`${id}`);
  }

  createQuote(quote: Partial<Quote>): Observable<Quote> {
    return this.post<Quote>('', quote);
  }

  updateQuote(id: string, quote: Partial<Quote>): Observable<Quote> {
    return this.put<Quote>(`${id}`, quote);
  }

  deleteQuote(id: string): Observable<void> {
    return this.delete(`${id}`);
  }

  updateQuoteStatus(id: string, status: string): Observable<Quote> {
    return this.put<Quote>(`${id}/status`, { status });
  }

  addNoteToQuote(id: string, author: string, text: string): Observable<Quote> {
    return this.post<Quote>(`${id}/notes`, { author, text });
  }

  addAttachmentToQuote(id: string, file: File, description?: string): Observable<Quote> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    return this.post<Quote>(`${id}/attachments`, formData);
  }

  isQuoteCancelled(quote: Quote): boolean {
    return quote.quoteItem?.some(item => item.state === 'cancelled') || false;
  }

  isQuoteAccepted(quote: Quote): boolean {
    return quote.quoteItem?.some(item => item.state === 'accepted') || false;
  }

  isQuoteFinalized(quote: Quote): boolean {
    return this.isQuoteCancelled(quote) || this.isQuoteAccepted(quote);
  }
} 