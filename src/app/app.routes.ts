import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginComponent } from './login/login.component';
import { ItemListComponent } from './items/item-list/item-list.component';
import { ItemFormComponent } from './items/item-form/item-form.component';
import { EmployeesComponent } from './employees/employees.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { PosterStockComponent } from './inventory/poster-stock/poster-stock.component';
import { AddPosterComponent, addPosterUnsavedChangesGuard } from './inventory/add-poster/add-poster.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { path: 'items', component: ItemListComponent, canActivate: [AuthGuard] },
  { path: 'items/new', component: ItemFormComponent, canActivate: [AuthGuard] },
  { path: 'items/:id/edit', component: ItemFormComponent, canActivate: [AuthGuard] },

  { path: 'inventory/poster-stock', component: PosterStockComponent, canActivate: [AuthGuard] },
  {
    path: 'inventory/add-poster',
    component: AddPosterComponent,
    canActivate: [AuthGuard],
    canDeactivate: [addPosterUnsavedChangesGuard]
  },

  { path: 'employees', component: EmployeesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'audit-log', component: AuditLogComponent, canActivate: [AuthGuard, AdminGuard] },

  { path: '**', redirectTo: 'login' }
];
