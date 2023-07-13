import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminSideBarComponent } from './adminSideBar/admin-side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [AdminComponent, AdminSideBarComponent, DashboardComponent],
  imports: [CommonModule, AdminRoutingModule],
})
export class AdminModule {}
