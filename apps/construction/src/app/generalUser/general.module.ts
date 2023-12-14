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
import { UserAccountComponent } from './user-account/user-account.component';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { AdvertisementsComponent } from './advertisements/advertisements.component';
import { NewAdvertisementComponent } from './advertisements/new-Advertisement/new-Advertisement.component';
import { EditAdvertisementComponent } from './advertisements/edit-advertisement/edit-advertisement.component';
import { SupportComponent } from './support/support.component';
import { NewSupportComponent } from './support/new-support/new-support.component';
import { PlanComponent } from '../common-components/plans/plan/plan.component';
import { MyPlansComponent } from '../common-components/plans/my-plans/myplans.component';
import { CustomPageComponent } from './custom-page/custom-page.component';
import { EditCustomPageComponent } from './custom-page/edit-custom-page/edit-custom-page.component';
import { AdvertisementPreviewComponent } from '../common-components/advertisement/advertisement-preview/advertisement-preview.component';
import { PreviewAdvertisementComponent } from './advertisements/preview-advertisement/preview-advertisement.component';
import { AdvertisementDetailsPreviewComponent } from '../common-components/advertisement/advertisement-details-preview/advertisement-details-preview.component';
import { AdvertisementViewComponent } from '../common-components/advertisement/advertisement-view/advertisement-view.component';
import { UserMessagesComponent } from './user-messages/user-messages.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { UserFavoriteAdvertisementsComponent } from './user-favorite-ads/user-favorite-ads.component';
import { UserMessagesDetailsComponent } from './user-messages/user-messages-details/user-messages-details.component';
import { UserAdvertisementDetailsViewComponent } from './advertisements/advertisement-details-view/advertisement-details-view.component';
import { UserAdvertisementViewComponent } from './advertisements/advertisement-view/advertisement-view.component';
import { RatingModule } from 'ngx-bootstrap/rating';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { PromoteToAdComponent } from './advertisements/promote-toAd/promote-toAd.component';
import { MyBidsComponent } from './my-bids/my-bids.component';
import { ViewBidComponent } from './my-bids/view-bid/view-bid.component';
import { MyRFPComponent } from './rfps/my-rfp.component';
import { NewRFPComponent } from './rfps/new-rfp/new-rfp.component';
import { PhoneNumberPipe } from '../pipes/phone-number.pipe';
import { UserReviewsComponent } from './user-reviews/user-reviews.component';
import { QuillModule } from 'ngx-quill';
import { QuillConfigModule } from 'ngx-quill/config';
import { RfpGuidelineComponent } from './rfps/rfp-guidline/rfp-guidline.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RFPPreviewComponent } from '../common-components/rfp/rfp-preview/rfp-preview.component';
import { RFPViewComponent } from '../common-components/rfp/rfp-view/rfp-view.component';
import { RFPDetailsPreviewComponent } from '../common-components/rfp/rfp-details-preview/rfp-details-preview.component';
import { RFPDetailsViewComponent } from '../common-components/rfp/rfp-details-view/rfp-details-view.component';
import { PreviewRFPComponent } from './rfps/rfp-advertisement/preview-rfp.component';

@NgModule({
  declarations: [
    GeneralComponent,
    GeneralSideBarComponent,
    DashboardComponent,
    UserProfileComponent,
    UserServicesComponent,
    PurchasePlanComponent,
    UserAccountComponent,
    AdvertisementsComponent,
    NewAdvertisementComponent,
    EditAdvertisementComponent,
    SupportComponent,
    NewSupportComponent,
    CustomPageComponent,
    EditCustomPageComponent,
    PreviewAdvertisementComponent,
    UserMessagesComponent,
    UserFavoriteAdvertisementsComponent,
    UserMessagesDetailsComponent,
    UserAdvertisementDetailsViewComponent,
    UserAdvertisementViewComponent,
    PromoteToAdComponent,
    MyBidsComponent,
    ViewBidComponent,
    MyRFPComponent,
    NewRFPComponent,
    UserReviewsComponent,
    RfpGuidelineComponent,
    PreviewRFPComponent,
  ],
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
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
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    NgbDropdownModule,
    MatStepperModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    PlanComponent,
    MyPlansComponent,
    AdvertisementDetailsPreviewComponent,
    AdvertisementPreviewComponent,
    AdvertisementViewComponent,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    RFPPreviewComponent,
    RFPViewComponent,
    RFPDetailsPreviewComponent,
    RFPDetailsViewComponent,
    RatingModule,
    NgxDropzoneModule,
    PhoneNumberPipe,
    RatingModule,
    QuillModule.forRoot(),
    QuillConfigModule.forRoot({
      modules: {
        syntax: true,
        toolbar: [],
      },
    }),
  ],
  providers: [],
})
export class GeneralModule {}
