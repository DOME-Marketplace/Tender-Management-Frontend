import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ProviderListComponent } from './pages/provider-list/provider-list.component';
import { providersRoutes } from './providers.routes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(providersRoutes)
  ]
})
export class ProvidersModule { }
