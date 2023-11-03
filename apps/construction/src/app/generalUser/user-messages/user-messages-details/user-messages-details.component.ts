import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { EncryptionService } from '../../../services/encryption-service';
import { FormService } from '../../../services/form.service';
import { StorageService } from '../../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take, tap, catchError, of, switchMap, map } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-user-messages-details',
  templateUrl: './user-messages-details.component.html',
  styleUrls: ['./user-messages-details.component.css'],
})
export class UserMessagesDetailsComponent {
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  apiService = inject(ApiService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  formService = inject(FormService);
  destroyRef = inject(DestroyRef);
  encryptionService = inject(EncryptionService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  user = this.storageService.getUser();
  userId = this.storageService?.getUserId();
  messageList: any[] = [];
  fb = inject(FormBuilder);
  messageForm: FormGroup;
  formErrors: string[] = [];
  userAdvertisementId!: any;
  message: any;

  messageId: any;
  messageInfo: any;
  constructor() {
    this.messageForm = this.fb.group({
      message: new FormControl('', [Validators.required]),
    });
    this.route.params
      .pipe(
        map((param) => param['id']),
        switchMap((id) => this.apiService.updateUserMessageView(id)),
        tap((id) => (this.messageId = id)),

        switchMap((id) => this.apiService.getUserMessageInfo(id)),
        switchMap((info) => {
          console.log(info, 'message info');
          this.messageInfo = info;
          return this.apiService
            .getAdvertisementMessageThreads(
              this.encryptionService.encryptItem(this.userId()),
              this.encryptionService.encryptItem(info?.fromUserId),
              info?.advertisementId
            )
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              take(1),
              tap((messages: any) => {
                this.messageList = messages;
              }),
              catchError((err) => {
                this.toastService.error('Adding failed', 'Failed', {
                  timeOut: 3000,
                  positionClass: 'toast-top-right',
                  closeButton: true,
                  progressBar: true,
                });
                return of(err);
              })
            );
        }),
        switchMap(() =>
          this.apiService.getUserNumberOfNewMessages(
            this.encryptionService.encryptItem(this.userId())
          )
        )
      )
      .subscribe();
  }
  sendMessage() {
    this.formErrors = [];
    if (this.messageForm.valid) {
      this.apiService
        .sendAdvertisementMessage(
          this.encryptionService.encryptItem(this.messageInfo?.fromUserId),
          this.encryptionService.encryptItem(this.userId()),
          this.messageInfo.advertisementId,
          this.message
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          take(1),
          tap((info: any) => {
            this.toastService.success('success', 'success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),
          catchError((err) => {
            this.toastService.error('Adding failed', 'Failed', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
            return of(err);
          }),
          switchMap(() =>
            this.apiService
              .getAdvertisementMessageThreads(
                this.encryptionService.encryptItem(this.userId()),
                this.encryptionService.encryptItem(
                  this.messageInfo?.fromUserId
                ),

                this.messageInfo?.advertisementId
              )
              .pipe(
                takeUntilDestroyed(this.destroyRef),
                take(1),
                tap((messages: any) => {
                  this.messageList = messages;
                }),
                catchError((err) => {
                  this.toastService.error('Adding failed', 'Failed', {
                    timeOut: 3000,
                    positionClass: 'toast-top-right',
                    closeButton: true,
                    progressBar: true,
                  });
                  return of(err);
                })
              )
          )
        )

        .subscribe();
    } else
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.messageForm
      );
  }
}
