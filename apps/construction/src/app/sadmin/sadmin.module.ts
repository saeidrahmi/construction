import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './sadmin-routing.module';
import { SAdminComponent } from './sadmin.component';
import { SAdminSideBarComponent } from './sadminSideBar/sadmin-side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';

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
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PlanComponent } from '../common-components/plan/plan.component';
import { EditPlanComponent } from './plans/edit-plan/edit-plan.component';
@NgModule({
  declarations: [
    SAdminComponent,
    SAdminSideBarComponent,
    DashboardComponent,
    UsersComponent,

    ListPlansComponent,
    CreatePlanComponent,
    AdminSettingsComponent,
    EditPlanComponent,
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
    MatDatepickerModule,
    MatNativeDateModule,
    PlanComponent,
  ],
})
export class AdminModule {}
