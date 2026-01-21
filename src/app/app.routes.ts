import { Routes } from '@angular/router';
import { FormsProductsComponent } from './modules/forms-products/forms-products.component';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: FormsProductsComponent }
];
