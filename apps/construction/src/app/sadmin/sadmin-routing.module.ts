import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SAdminComponent } from './sadmin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SAdminSideBarComponent } from './sadminSideBar/sadmin-side-bar.component';
import { UsersComponent } from './users/users.component';

import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { ListPlansComponent } from './plans/list-plans/list-plans.component';
import { CreatePlanComponent } from './plans/createPlan/createPlan.component';
import { EditPlanComponent } from './plans/edit-plan/edit-plan.component';
import { AdvertisementsPendingApprovalComponent } from './user-advertisements/advertisements-pending-approval/advertisements-pending-approval.component';
const routes: Routes = [
  {
    path: '',
    component: SAdminComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'list-plans',
        component: ListPlansComponent,
      },
      {
        path: 'create-plan',
        component: CreatePlanComponent,
      },
      {
        path: 'admin-settings',
        component: AdminSettingsComponent,
      },
      {
        path: 'edit-plan/:id',
        component: EditPlanComponent,
      },
      {
        path: 'advertisements-pending-approval',
        component: AdvertisementsPendingApprovalComponent,
      },
      {
        path: '',
        outlet: 'admin-outlet',
        component: SAdminSideBarComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
