import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Tender, Tender_Create, Tender_Update } from '../../shared/models/tender.model';

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  private readonly STORAGE_KEY = 'tenders';
  private tendersSubject = new BehaviorSubject<Tender[]>([]);
  public tenders$ = this.tendersSubject.asObservable();

  constructor() {
    this.loadTendersFromStorage();
  }

  private loadTendersFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const tenders = JSON.parse(stored);
        this.tendersSubject.next(tenders);
      } catch (error) {
        console.error('Error loading tenders from storage:', error);
        this.tendersSubject.next([]);
      }
    }
  }

  private saveTendersToStorage(tenders: Tender[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tenders));
    this.tendersSubject.next(tenders);
  }

  private generateId(): string {
    return 'tender_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getTenders(): Observable<Tender[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const tenders = stored ? JSON.parse(stored) : [];
    return of(tenders).pipe(delay(100)); // Simulate API delay
  }

  getTendersByExternalId(externalId: string): Observable<Tender[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const childTenders = tenders.filter(t => t.external_id === externalId);
    return of(childTenders).pipe(delay(100));
  }

  getTenderById(id: string): Observable<Tender> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const tender = tenders.find(t => t.id === id);
    
    if (tender) {
      return of(tender).pipe(delay(100));
    } else {
      return throwError(() => new Error('Tender not found'));
    }
  }

  createTender(tenderData: Tender_Create): Observable<Tender> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    
    const newTender: Tender = {
      ...tenderData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tenders.push(newTender);
    this.saveTendersToStorage(tenders);
    
    return of(newTender).pipe(delay(100));
  }

  createMultipleTenders(tendersData: Tender_Create[]): Observable<Tender[]> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    
    const newTenders: Tender[] = tendersData.map(tenderData => ({
      ...tenderData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    tenders.push(...newTenders);
    this.saveTendersToStorage(tenders);
    
    return of(newTenders).pipe(delay(100));
  }

  updateTender(id: string, updates: Tender_Update): Observable<Tender> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const index = tenders.findIndex(t => t.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Tender not found'));
    }
    
    tenders[index] = {
      ...tenders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveTendersToStorage(tenders);
    
    return of(tenders[index]).pipe(delay(100));
  }

  deleteTender(id: string): Observable<void> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const tenders: Tender[] = stored ? JSON.parse(stored) : [];
    const filteredTenders = tenders.filter(t => t.id !== id);
    
    this.saveTendersToStorage(filteredTenders);
    
    return of(void 0).pipe(delay(100));
  }

  // Helper method to convert File to base64
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

  // Helper method to download attachment
  downloadAttachment(tender: Tender): void {
    if (!tender.attachment) {
      throw new Error('No attachment found');
    }

    const byteCharacters = atob(tender.attachment.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: tender.attachment.mimeType });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = tender.attachment.name;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

