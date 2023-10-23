import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { EncryptionService } from '../../../services/encryption-service';
import { StorageService } from '../../../services/storage.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdvertisementInterface } from '../../../models/advertisement';
import { CommonUtilityService } from '../../../services/common-utility.service';

@Component({
  selector: 'app-new-Advertisement',
  templateUrl: './new-Advertisement.component.html',
  styleUrls: ['./new-Advertisement.component.css'],
})
export class NewAdvertisementComponent {
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  fb = inject(FormBuilder);
  form: FormGroup;
  encryptionService = inject(EncryptionService);
  storageService = inject(StorageService);
  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);
  canAdvertise: boolean;
  generalInfo: any;
  advertisement: AdvertisementInterface = {};
  headerImageFile: any;
  constructor() {
    const userId = this.storageService?.getUserId();
    this.apiService
      .canUserAdvertise(this.encryptionService.encryptItem(userId()))
      .pipe(
        takeUntilDestroyed(),
        tap((info: any) => {
          this.generalInfo = info;
          if (!info?.result) this.canAdvertise = false;
          else this.canAdvertise = true;
        }),
        catchError((err) => {
          this.canAdvertise = false;
          this.toastService.error(
            'Getting Info failed. ' + err,
            'Server failure',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );

          return of(err);
        })
      )
      .subscribe();
    this.form = this.fb.group({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      headerImage: new FormControl('', []),
    });
  }

  headerImageHandler(event: any) {
    this.headerImageFile = event?.target?.files[0];
    const maxFileSize = this.commonUtility._advertisementHeaderMaxSize;
    const allowedFileTypes = this.commonUtility._advertisementHeaderMimeTypes;
    if (this.headerImageFile) {
      const fileType = this.headerImageFile?.name
        ?.split('.')
        ?.pop()
        ?.toLowerCase();
      if (fileType && !allowedFileTypes?.includes(fileType)) {
        this.toastService.error(
          'Selected file type is not allowed. Please select a file with one of the following extensions: ' +
            allowedFileTypes.join(', '),
          'Wrong File Type',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          }
        );
        this.form.get('photo')?.setValue('');
        this.headerImageFile = null;
      }
      if (
        this.headerImageFile?.size == 0 ||
        this.headerImageFile?.size > maxFileSize
      ) {
        this.toastService.error(
          'File size can not be empty and can not exceeds the maximum limit of 1 MB',
          'Wrong File Size',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          }
        );
        this.form.get('headerImage')?.setValue('');
        this.headerImageFile = null;
      } else {
        // file ok
      }
    }
  }
  submit() {}
}
