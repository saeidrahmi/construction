import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import {
  tap,
  catchError,
  of,
  switchMap,
  Observable,
  startWith,
  map,
} from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { EncryptionService } from '../../../services/encryption-service';
import { StorageService } from '../../../services/storage.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AdvertisementInterface } from '../../../models/advertisement';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { Router } from '@angular/router';

import { FormService } from '../../../services/form.service';
import { MatStepper } from '@angular/material/stepper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UserService } from '../../../services/user-service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { RFPInterface } from '../../../models/rfp';

@Component({
  selector: 'app-new-rfp',
  templateUrl: './new-rfp.component.html',
  styleUrls: ['./new-rfp.component.css'],
})
export class NewRFPComponent {
  toastService = inject(ToastrService);
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  apiService = inject(ApiService);
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fb = inject(FormBuilder);
  utilityService = inject(CommonUtilityService);
  filteredTags: Observable<string[]>;
  files: File[] = [];
  form: FormGroup;
  formErrors: string[] = [];
  myTags: string[] = [];
  encryptionService = inject(EncryptionService);
  announcer = inject(LiveAnnouncer);
  formService = inject(FormService);
  router = inject(Router);
  storageService = inject(StorageService);

  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);

  tagCtrl = new FormControl('');
  generalInfo: any;
  tax;
  headerImageFile: any;
  rfpPrice: any;
  maxRFPSliderImage: number;
  userRFPDuration: number;
  sliderImages: any[] = [];
  userId = this.storageService?.getUserId();
  constructionServices = this.userService.getConstructionServices();
  advertisement: RFPInterface;

  imageWidth: number;
  imageHeight: number;
  rfpDiscount: any;

  constructor(
    private sanitizer: DomSanitizer,
    public userService: UserService
  ) {
    this.advertisement = {};
    this.advertisement.dateCreated = new Date();
    this.advertisement.sliderImages = [];
    this.advertisement.sliderImageFiles = [];
    this.apiService
      .getApplicationSetting()
      .pipe(
        takeUntilDestroyed(),
        tap((info: any) => {
          this.rfpPrice = info.rfpPrice;
          this.rfpDiscount = info.rfpDiscount;
          this.tax = info.tax;
          this.maxRFPSliderImage = info.maxRFPSliderImage;
          this.userRFPDuration = info.userRFPDuration;
        })
      )
      .subscribe();

    // const newDate = new Date(
    //   this.advertisement.dateCreated.getTime() - 5 * 24 * 60 * 60 * 1000
    // );
    // this.advertisement.dateCreated = newDate;

    this.form = this.fb.group({
      formArray: this.fb.array([
        this.fb.group({
          tags: new FormControl('', [Validators.required]),
        }),
        this.fb.group(
          {
            startDate: new FormControl('', [Validators.required]),
            endDate: new FormControl('', [Validators.required]),
            projectStartDate: new FormControl('', []),
          },
          {
            validator: this.validateRfpDuration.bind(this), // Add your custom validator function here
          }
        ),
        this.fb.group({
          title: new FormControl('', [Validators.required]),
          description: new FormControl('', [Validators.required]),
          headerImage: new FormControl('', []),
          contractorQualifications: new FormControl('', []),

          milestones: new FormControl('', []),
          insuranceRequirements: new FormControl('', []),
          budgetInformation: new FormControl('', []),
        }),
        this.fb.group({
          showPicture: new FormControl('', []),
          isTurnkey: new FormControl('', []),
        }),
        this.fb.group({
          sliderImages: new FormArray([]),
        }),
      ]),
    });
    //  this.formArray?.get([1]).setValidators(this.validateRfpDuration);
    this.filteredTags = this.tagCtrl?.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filterTags(item) : this.constructionServices.slice()
      )
    );
  }

  // validateRfpDuration(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const start = control.get('startDate').value;
  //     const end = control.get('endDate').value;
  //     const duration = this.userService.differenceInDays(start, end);
  //     console.log(duration, this.userRFPDuration, 'valid');
  //     if (duration > this.userRFPDuration) return { durationInvalid: true };
  //     else return null;
  //   };
  // }
  validateRfpDuration: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const start = control.get('startDate').value;
    const end = control.get('endDate').value;
    const duration = this.userService.differenceInDays(start, end);

    if (duration > this.userRFPDuration) {
      return { rfpDurationInvalid: true };
    } else {
      return null;
    }
  };

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.constructionServices.filter((item) =>
      item.toLowerCase().includes(filterValue)
    );
  }
  get formArray(): AbstractControl | null {
    return this.form?.get('formArray');
  }
  // getClienttFormArrayControls() {
  //   return (this.formArray?.get([2]).get('sliderImages') as FormArray).controls;
  // }
  goForward(stepper: MatStepper, index: number) {
    this.formErrors = this.formService.getFormValidationErrorMessages(
      this.formArray?.get([index]) as FormGroup
    );
    stepper.next();
  }

  getObjectURL(file: File): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
  }
  deleteHeaderImage() {
    this.headerImageFile = null;
    this.advertisement.headerImage = null;
    this.advertisement.headerImageUrl = null;
  }
  headerImageHandler(event: any): void {
    const headerImageFile = event?.target?.files[0];

    if (headerImageFile) {
      const fileType = headerImageFile?.name?.split('.')?.pop()?.toLowerCase();
      const allowedFileTypes = this.commonUtility._imageMimeTypes;
      const maxFileSize = this.commonUtility._advertisementHeaderMaxSize;

      // Check file type
      if (fileType && !allowedFileTypes?.includes(fileType)) {
        this.handleImageError(
          'Selected file type is not allowed. Please select a file with one of the following extensions: ' +
            allowedFileTypes.join(', '),
          'Wrong File Type'
        );
        return;
      }

      // Check file size
      if (headerImageFile.size === 0 || headerImageFile.size > maxFileSize) {
        this.handleImageError(
          `File size can not be empty and cannot exceed the maximum limit of ${this.utilityService.convertBytesToKbOrMb(
            maxFileSize
          )}`,
          'Wrong File Size'
        );
        return;
      }

      // Check image dimensions
      const [minWidth, maxWidth] =
        this.commonUtility._advertisementHeaderMinMaxWidthHeightPixel[0];
      const [minHeight, maxHeight] =
        this.commonUtility._advertisementHeaderMinMaxWidthHeightPixel[1];

      const img = new Image();
      img.src = URL.createObjectURL(headerImageFile);

      img.onload = () => {
        const imageWidth = img.width;
        this.imageWidth = img.width;
        const imageHeight = img.height;
        this.imageHeight = img.height;

        if (
          imageWidth < minWidth ||
          imageWidth > maxWidth ||
          imageHeight < minHeight ||
          imageHeight > maxHeight
        ) {
          this.handleImageError(
            `Image dimensions must be between ${minWidth}x${minHeight} and ${maxWidth}x${maxHeight} pixels.`,
            'Invalid Image Dimensions'
          );
        } else {
          // Image is within the specified dimensions
          this.advertisement.headerImageUrl = `url(${img.src})`;
          this.advertisement.headerImage = img.src;
          this.headerImageFile = headerImageFile;
        }
      };
    }
  }

  private handleImageError(message: string, title: string): void {
    this.toastService.error(message, title, {
      timeOut: 3000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
    });
    this.headerImageFile = null;
  }

  submitNewRfp(stepper: MatStepper) {
    if (this.form.valid) {
      const userId = this.storageService?.getUserId();
      const formData = new FormData();
      formData.append('userId', this.encryptionService.encryptItem(userId()));
      if (this.headerImageFile)
        formData.append(
          'headerImage',
          this.headerImageFile,
          this.headerImageFile.name
        );
      else formData.append('headerImage', '');

      if (this.advertisement.sliderImageFiles) {
        for (const file of this.advertisement.sliderImageFiles) {
          formData.append('sliderImages', file, file.name);
        }
      } else formData.append('sliderImages', '');

      formData.append('title', this.advertisement?.title);

      formData.append(
        'milestones',
        `${
          this.advertisement?.milestones ? this.advertisement?.milestones : ''
        }`
      );
      formData.append(
        'budgetInformation',
        `${
          this.advertisement?.budgetInformation
            ? this.advertisement?.budgetInformation
            : ''
        }`
      );
      formData.append(
        'contractorQualifications',
        `${
          this.advertisement?.contractorQualifications
            ? this.advertisement?.contractorQualifications
            : ''
        }`
      );
      formData.append('tags', this.myTags.join(', '));
      formData.append('description', this.advertisement?.description);
      formData.append(
        'insuranceRequirements',
        `${
          this.advertisement?.insuranceRequirements
            ? this.advertisement?.insuranceRequirements
            : ''
        }`
      );

      formData.append('startDate', `${this.advertisement?.startDate}`);
      formData.append(
        'projectStartDate',
        `${
          this.advertisement?.projectStartDate
            ? this.advertisement?.projectStartDate
            : ''
        }`
      );
      formData.append('endDate', `${this.advertisement?.endDate}`);
      const amount = this.rfpPrice;
      const discount = (amount * this.rfpDiscount) / 100;
      const amountAfterDiscount = amount - discount;
      const tax = (amountAfterDiscount * this.tax) / 100;
      const totalAmount =
        parseFloat(amountAfterDiscount.toString()) + parseFloat(tax.toString());

      formData.append('paymentConfirmation', `PAL-235894-CONFIRM`);
      formData.append('paymentAmount', `${amount}`);
      formData.append('amountAfterDiscount', `${amountAfterDiscount}`);
      formData.append('discountPercentage', `${this.rfpDiscount}`);
      formData.append('discount', `${discount}`);
      formData.append('tax', `${tax}`);
      formData.append('totalPayment', `${totalAmount}`);

      formData.append(
        'isTurnkey',
        `${this.advertisement?.isTurnkey ? '1' : '0'}`
      );
      formData.append(
        'showPicture',
        `${this.advertisement?.showPicture ? '1' : '0'}`
      );

      formData.append('userRFPDuration', `${this.userRFPDuration}`);
      // formData.append('expiryDate', `${expiryDate}`);
      // formData.append('dateCreated', `${dateCreated}`);

      this.apiService
        .saveUserRFP(formData)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.headerImageFile = null;
            //this.sliderImages = [];
            this.form.reset();
            this.myTags = [];
            stepper.reset();
            this.storageService.clearAdvertisementInfo();
            this.toastService.success('Saved Successfully. ', 'Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          })
        )
        .subscribe();
    } else {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.formArray?.get([0]) as FormGroup
      );
    }
  }

  onFilesAdded(event: any): void {
    const newFiles: File[] = event.addedFiles;

    // Calculate how many files can be added to reach the maximum limit
    const remainingSlots = this.maxRFPSliderImage - this.files.length;

    if (remainingSlots <= 0) {
      this.toastService.error(
        `You can upload only ${this.maxRFPSliderImage} images`,
        'Error',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          closeButton: true,
          progressBar: true,
        }
      );
    } else {
      // Filter out invalid files asynchronously
      this.filterValidFiles(newFiles).then((validFiles) => {
        // Check if adding new files would exceed the remaining slots
        this.files = [...this.files, ...validFiles.slice(0, remainingSlots)];

        // Clear existing slider image data
        this.advertisement.sliderImageFiles = [];
        this.advertisement.sliderImages = [];

        // Process each file
        for (const sliderImageFile of this.files) {
          if (sliderImageFile) {
            const imageUrl = URL.createObjectURL(sliderImageFile);
            this.advertisement.sliderImageFiles.push(sliderImageFile);
            this.advertisement.sliderImages.push(`${imageUrl}`);
          }
        }
      });
    }
  }

  async filterValidFiles(files: File[]): Promise<File[]> {
    const validFiles: File[] = [];

    for (const file of files) {
      if (await this.isValidFile(file)) {
        validFiles.push(file);
      }
    }

    return validFiles;
  }

  isValidFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const maxFileSize = this.commonUtility._sliderPhotoMaxSize;
      const allowedFileTypes = this.commonUtility._imageMimeTypes;
      const fileType = file?.name?.split('.').pop()?.toLowerCase();
      const fileSize = file?.size;
      const [minWidth, maxWidth] =
        this.commonUtility._sliderPhotoMinMaxWidthHeightPixel[0];
      const [minHeight, maxHeight] =
        this.commonUtility._sliderPhotoMinMaxWidthHeightPixel[1];

      if (!this.isValidFileType(fileType, allowedFileTypes)) {
        this.handleImageError(
          'Selected file type is not allowed. Please select a file with one of the following extensions: ' +
            allowedFileTypes.join(', '),
          'Wrong File Type'
        );
        resolve(false);
      } else if (!this.isValidFileSize(fileSize, maxFileSize)) {
        this.handleImageError(
          `File size cannot be empty and cannot exceed the maximum limit of ${maxFileSize}`,
          'Wrong File Size'
        );
        resolve(false);
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const imageWidth = img.width;
        const imageHeight = img.height;

        if (
          imageWidth < minWidth ||
          imageWidth > maxWidth ||
          imageHeight < minHeight ||
          imageHeight > maxHeight
        ) {
          this.handleImageError(
            `Image dimensions must be between ${minWidth}x${minHeight} and ${maxWidth}x${maxHeight} pixels.`,
            'Invalid Image Dimensions'
          );
          resolve(false);
        } else {
          file['width'] = imageWidth;
          file['height'] = imageHeight;
          resolve(true);
        }
      };
    });
  }

  private isValidFileType(
    fileType: string,
    allowedFileTypes: string[] | undefined
  ): boolean {
    return (
      !!fileType && !!allowedFileTypes && allowedFileTypes.includes(fileType)
    );
  }

  private isValidFileSize(
    fileSize: number | undefined,
    maxFileSize: number
  ): boolean {
    return !!fileSize && fileSize <= maxFileSize;
  }

  onFileDeleted(index: number) {
    // Delete the file at the specified index
    this.files.splice(index, 1);
    //this.sliderImages = [];
    this.advertisement.sliderImageFiles = [];
    this.advertisement.sliderImages = [];
    for (const sliderImageFile of this.files) {
      const imageUrl = URL.createObjectURL(sliderImageFile);
      //this.sliderImages.push(sliderImageFile);
      this.advertisement.sliderImageFiles.push(sliderImageFile);
      this.advertisement.sliderImages.push(`${imageUrl}`);
      this.storageService.updateSelectedAdvertisement(
        this.advertisement,
        'new'
      );
    }
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && this.myTags.includes(value)) {
      this.toastService.error('Tag exists. ', 'Error', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
    }
    // Add service
    else {
      this.myTags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    this.tagCtrl.setValue(null);
    //this.formArray?.get([0]).get('tags').setValue(null);
  }

  removeTag(item: string): void {
    const index = this.myTags.indexOf(item);
    if (index >= 0) {
      this.myTags.splice(index, 1);

      this.announcer.announce(`Removed ${item}`);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (this.myTags.includes(value))
      this.toastService.error('Tag exist. ', 'Error', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
    else {
      this.myTags.push(value);
    }
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
    //this.formArray?.get([0]).get('tags').setValue(null);
  }
}
