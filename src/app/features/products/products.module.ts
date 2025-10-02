import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { productsRoutes } from './products.routes';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { NotificationComponent } from '../../shared/components/notification/notification.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(productsRoutes),
    ProductListComponent,
    ProductDetailsComponent,
    ProductFormComponent,
    NotificationComponent,
    ConfirmDialogComponent
  ]
})
export class ProductsModule { } 