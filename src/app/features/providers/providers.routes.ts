import { Routes } from '@angular/router';

export const providersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/provider-list/provider-list.component').then(m => m.ProviderListComponent)
  }
];
