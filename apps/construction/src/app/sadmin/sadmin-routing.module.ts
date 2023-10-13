import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SAdminComponent } from './sadmin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SAdminSideBarComponent } from './sadminSideBar/sadmin-side-bar.component';
import { UsersComponent } from './users/users.component';

import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { ListPlansComponent } from './plans/list-plans/list-plans.component';
import { CreatePlanComponent } from './plans/createPlan/createPlan.component';
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
