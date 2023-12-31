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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ListPlansComponent } from './plans/list-plans/list-plans.component';
import { CreatePlanComponent } from './plans/createPlan/createPlan.component';
import { FormErrorsComponent } from '../public/form-errors.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PlanComponent } from '../common-components/plans/plan/plan.component';
import { EditPlanComponent } from './plans/edit-plan/edit-plan.component';
import { AdvertisementsPendingApprovalComponent } from './user-advertisements/advertisements-pending-approval/advertisements-pending-approval.component';
import { AdvertisementViewComponent } from '../common-components/advertisement/advertisement-view/advertisement-view.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { AdminAdvertisementDetailsViewComponent } from './user-advertisements/advertisements-pending-approval/advertisement-details-view/advertisement-details-view.component';
import { AdminAdvertisementViewComponent } from './user-advertisements/advertisements-pending-approval/advertisement-view/advertisement-view.component';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ChangeUserPermissionComponent } from './users/change-user-permissions/change-permission.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CreateUserComponent } from './users/create-user/create-user.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { ChangePasswordComponent } from '../common-components/change-password/change-password.component';
import { ViewUserComponent } from './users/view-user/view-user.component';
import { MyPlansComponent } from '../common-components/plans/my-plans/myplans.component';
import { NgChartsModule } from 'ng2-charts';
import { UserDashboardDetailsComponent } from './dashboard/user-dashobard-details/user-dashboard-details.component';
import { SalesDashboardComponent } from './dashboard/sales-dashboard/sales-dashboard.component';
import { PhoneNumberPipe } from '../pipes/phone-number.pipe';
import { QuillModule } from 'ngx-quill';
import { SupportComponent } from './support/support.component';
import { AdminRfpDetailsViewComponent } from './user-rfps/rfp-details-view/rfp-details-view.component';
import { RfpPendingApprovalComponent } from './user-rfps/rfp-pending-approval.component';
import { AdminRFPViewComponent } from './user-rfps/rfp-view/rfp-view.component';

@NgModule({
  declarations: [
    SAdminComponent,
    SAdminSideBarComponent,
    DashboardComponent,
    UsersComponent,
    AdvertisementsPendingApprovalComponent,
    ListPlansComponent,
    CreatePlanComponent,
    AdminSettingsComponent,
    EditPlanComponent,
    AdminAdvertisementViewComponent,
    AdminAdvertisementDetailsViewComponent,
    CreateUserComponent,
    ChangeUserPermissionComponent,
    UserProfileComponent,
    ViewUserComponent,
    UserDashboardDetailsComponent,
    SalesDashboardComponent,
    SupportComponent,
    RfpPendingApprovalComponent,
    AdminRFPViewComponent,
    AdminRfpDetailsViewComponent,
  ],
  imports: [
    NgChartsModule,
    ChangePasswordComponent,
    NgxMaskDirective,
    NgxMaskPipe,
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
    AdvertisementViewComponent,
    MatButtonModule,
    MatSelectModule,
    RatingModule,
    FormErrorsComponent,
    FormsModule,
    MatCheckboxModule,
    MyPlansComponent,
    PhoneNumberPipe,
    QuillModule,
  ],
})
export class AdminModule {}
