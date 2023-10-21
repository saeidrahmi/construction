import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralComponent } from './general.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GeneralSideBarComponent } from './generalSideBar/general-side-bar.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ChangePasswordComponent } from '../common-components/change-password/change-password.component';
import { UserServicesComponent } from './user-services/user-services.component';
import { PurchasePlanComponent } from './purchase-plan/purchase-plan.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { AdvertisementsComponent } from './advertisements/advertisements.component';
import { NewAdvertisementComponent } from './advertisements/new-Advertisement/new-Advertisement.component';
import { EditAdvertisementComponent } from './advertisements/edit-advertisement/edit-advertisement.component';
import { SupportComponent } from './support/support.component';
import { NewSupportComponent } from './support/new-support/new-support.component';
import { CustomPageComponent } from './custom-page/custom-page.component';
import { EditCustomPageComponent } from './custom-page/edit-custom-page/edit-custom-page.component';
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
        path: 'user-services',
        component: UserServicesComponent,
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'purchase-plan',
        component: PurchasePlanComponent,
      },
      {
        path: 'user-account',
        component: UserAccountComponent,
      },
      {
        path: 'user-advertisements',
        component: AdvertisementsComponent,
      },
      {
        path: 'new-advertisement',
        component: NewAdvertisementComponent,
      },
      {
        path: 'edit-advertisement/:id',
        component: EditAdvertisementComponent,
      },
      {
        path: 'request-support',
        component: SupportComponent,
      },
      {
        path: 'new-support',
        component: NewSupportComponent,
      },
      {
        path: 'custom-page',
        component: CustomPageComponent,
      },
      {
        path: 'edit-custom-page',
        component: EditCustomPageComponent,
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
