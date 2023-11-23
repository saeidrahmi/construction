import { Component, DestroyRef, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';
import { RatingInterface } from '../../models/rating';
import { RatingModule } from 'ngx-bootstrap/rating';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonUtilityService } from '../../services/common-utility.service';
import { EncryptionService } from '../../services/encryption-service';
import { FormErrorsComponent } from '../form-errors.component';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-view-reviews',
  templateUrl: './view-reviews.component.html',
  styleUrls: ['./view-reviews.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterModule,
    RatingModule,
    FormsModule,
    ReactiveFormsModule,
    FormErrorsComponent,
  ],
})
export class ViewReviewsComponent {
  formService = inject(FormService);
  fb = inject(FormBuilder);
  feedbackForm: FormGroup;
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  commonUtility = inject(CommonUtilityService);
  apiService = inject(ApiService);
  router = inject(Router);
  storageService = inject(StorageService);
  encryptionService = inject(EncryptionService);
  ratings: any;
  userRating: RatingInterface = {};
  max: number;
  isLoggedIn = this.storageService.isUserLoggedIn();
  userId = this.storageService?.getUserId();
  advertisement: any;
  formErrors: any[] = [];
  adObject = this.storageService?.getAdvertisement()();
  userRatingDetails$ = this.apiService
    .getAllUserRatingsDetails(this.adObject?.advertisementIdSelected)
    .pipe(
      takeUntilDestroyed(),
      tap((data: any) => {
        this.ratings = data;
        this.userRating = data.avgRatings;
        //
      })
    );
  feedback: any = '';
  constructor() {
    this.feedbackForm = this.fb.group({
      feedback: new FormControl('', [Validators.required]),
    });

    this.max = this.commonUtility.getMaxUserRating();

    if (
      this.adObject?.advertisementIdSelected &&
      this.adObject?.advertisementAction === 'view'
    ) {
      this.advertisement = this.adObject.advertisementSelected;

      this.userRatingDetails$.subscribe();
    } else this.router.navigate(['/advertisements']);
  }
  updateUserOverallRating(rate: any, rateType: string) {
    if (this.isLoggedIn())
      this.apiService
        .addUserRating(
          rate,
          this.encryptionService.encryptItem(this.advertisement?.userId),
          this.encryptionService.encryptItem(this.userId()),
          rateType
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success('success', 'success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),

          switchMap(() =>
            this.apiService
              .getUserRatings(this.advertisement?.userAdvertisementId)
              .pipe(
                takeUntilDestroyed(this.destroyRef),
                tap((ratings: any) => {
                  this.userRating = { ...ratings };
                })
              )
          )
        )

        .subscribe();
    else
      this.toastService.error('Please login first', 'Failed', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
  }
  sendFeedback() {
    this.formErrors = [];
    if (this.feedbackForm.valid) {
      if (this.isLoggedIn())
        this.apiService
          .sendUserFeedback(
            this.encryptionService.encryptItem(this.advertisement?.userId),
            this.encryptionService.encryptItem(this.userId()),
            this.feedback
          )
          .pipe(
            takeUntilDestroyed(this.destroyRef),

            tap((info: any) => {
              this.toastService.success('success', 'success', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              });
            }),
            switchMap(() => this.userRatingDetails$)
          )

          .subscribe();
      else
        this.toastService.error('Please login first', 'Failed', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          closeButton: true,
          progressBar: true,
        });
    } else
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.feedbackForm
      );
  }
}
