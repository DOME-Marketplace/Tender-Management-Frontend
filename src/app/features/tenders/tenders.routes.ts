import { Routes } from '@angular/router';
import { TenderManagementComponent } from './pages/tender-management/tender-management.component';

export const tendersRoutes: Routes = [
  {
    path: '',
    component: TenderManagementComponent,
    children: [
      {
        path: '',
        redirectTo: 'buyer',
        pathMatch: 'full'
      },
      {
        path: 'buyer',
        loadComponent: () => import('./pages/tender-dashboard/tender-dashboard-buyer.component').then(m => m.TenderDashboardBuyerComponent)
      },
      {
        path: 'seller',
        loadComponent: () => import('./pages/tender-dashboard/tender-dashboard-seller.component').then(m => m.TenderDashboardSellerComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/new-tender/new-tender.component').then(m => m.NewTenderComponent)
      },
      {
        path: ':id/status',
        loadComponent: () => import('./components/status-management/status-management.component').then(m => m.StatusManagementComponent)
      }
    ]
  }
];

