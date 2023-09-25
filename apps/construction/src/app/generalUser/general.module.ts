import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { GeneralSideBarComponent } from './generalSideBar/general-side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { FormErrorsComponent } from '../public/form-errors.component';
import { ApiServerErrorComponent } from '../public/apiServerError/api-server-error.component';
import { GoogleMapsModule } from '@angular/google-maps';
@NgModule({
  declarations: [
    GeneralComponent,
    GeneralSideBarComponent,
    DashboardComponent,
    UserProfileComponent,
  ],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    ReactiveFormsModule,
    FormErrorsComponent,
    ApiServerErrorComponent,
    GoogleMapsModule,
  ],
})
export class GeneralModule {}
