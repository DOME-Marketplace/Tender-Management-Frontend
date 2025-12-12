import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { tendersRoutes } from './tenders.routes';
import { TenderManagementComponent } from './pages/tender-management/tender-management.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(tendersRoutes),
    TenderManagementComponent
  ],
  declarations: []
})
export class TendersModule { } 
