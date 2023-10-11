import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './sadmin-routing.module';
import { SAdminComponent } from './sadmin.component';
import { SAdminSideBarComponent } from './sadminSideBar/sadmin-side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { PlansComponent } from './plans/plans.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ListPlansComponent } from './plans/list-plans/list-plans.component';
import { CreatePlanComponent } from './plans/createPlan/createPlan.component';
import { FormErrorsComponent } from '../public/form-errors.component';

@NgModule({
  declarations: [
    SAdminComponent,
    SAdminSideBarComponent,
    DashboardComponent,
    UsersComponent,
    PlansComponent,
    ListPlansComponent,
    CreatePlanComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule,
    FormErrorsComponent,
  ],
})
export class AdminModule {}
