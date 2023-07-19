import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralComponent } from './general.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GeneralSideBarComponent } from './generalSideBar/general-side-bar.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
const routes: Routes = [
  {
    path: '',
    component: GeneralComponent,
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
        path: 'user-profile',
        component: UserProfileComponent,
      },
      {
        path: '',
        outlet: 'general-outlet',
        component: GeneralSideBarComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GeneralRoutingModule {}
