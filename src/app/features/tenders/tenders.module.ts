import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { tendersRoutes } from './tenders.routes';
import { QuoteListComponent } from './pages/quote-list/quote-list.component';
import { NotificationComponent } from '../../shared/components/notification/notification.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(tendersRoutes),
    QuoteListComponent,
    NotificationComponent
  ],
  declarations: []
})
export class TendersModule { } 
