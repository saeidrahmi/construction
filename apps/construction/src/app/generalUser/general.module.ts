import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { GeneralSideBarComponent } from './generalSideBar/general-side-bar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { FormErrorsComponent } from '../public/form-errors.component';
import { ApiServerErrorComponent } from '../public/apiServerError/api-server-error.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MatChipsModule } from '@angular/material/chips';
import { UserServicesComponent } from './user-services/user-services.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PurchasePlanComponent } from './purchase-plan/purchase-plan.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [
    GeneralComponent,
    GeneralSideBarComponent,
    DashboardComponent,
    UserProfileComponent,
    UserServicesComponent,
    PurchasePlanComponent,
  ],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    ReactiveFormsModule,
    FormErrorsComponent,
    ApiServerErrorComponent,
    GoogleMapsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatChipsModule,
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,

    MatAutocompleteModule,
    NgbDropdownModule,
    MatStepperModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
  ],
  providers: [],
})
export class GeneralModule {}
