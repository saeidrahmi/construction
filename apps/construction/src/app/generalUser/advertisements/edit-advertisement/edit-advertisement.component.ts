import { ImageService } from './../../../services/image-service';
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
  first,
  switchMap,
  map,
  startWith,
  Observable,
  of,
  OperatorFunction,
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  merge,
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
  Validators,
} from '@angular/forms';
import { AdvertisementInterface } from '../../../models/advertisement';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { Router } from '@angular/router';
import { AdvertisementCommunicationService } from '../../../services/advertisementServcie';
import { FormService } from '../../../services/form.service';
import { MatStepper } from '@angular/material/stepper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { UserService } from '../../../services/user-service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-advertisement',
  templateUrl: './edit-advertisement.component.html',
  styleUrls: ['./edit-advertisement.component.css'],
})
export class EditAdvertisementComponent {
  files: File[] = [];
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  imageService = inject(ImageService);
  fb = inject(FormBuilder);
  form: FormGroup;
  tagCtrl = new FormControl('');
  separatorKeysCodes: number[] = [ENTER, COMMA];
  formErrors: string[] = [];
  encryptionService = inject(EncryptionService);
  formService = inject(FormService);
  router = inject(Router);
  storageService = inject(StorageService);
  advertisementCommunicationService = inject(AdvertisementCommunicationService);
  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);
  utilityService = inject(CommonUtilityService);
  generalInfo: any;
  advertisement: AdvertisementInterface = {};
  headerImageFile: any;
  topAdPrice: any;
  maxAdvertisementSliderImage: number;
  userAdvertisementDuration: number;
  sliderImages: any[] = [];
  userId = this.storageService?.getUserId();
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  filteredTags: Observable<string[]>;
  myTags: string[] = [];
  announcer = inject(LiveAnnouncer);
  @ViewChild('instance', { static: true }) instance: NgbTypeahead;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  searchCategories: OperatorFunction<string, readonly string[]> = (
    text$: Observable<string>
  ) => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.click$.pipe(
      filter(() => !this.instance?.isPopupOpen())
    );
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === ''
          ? this.advertisement.adType === 'rental'
            ? this.userService.getConstructionRentalsTags()
            : this.userService.getConstructionSales()
          : this.advertisement.adType === 'rental'
          ? this.userService.getConstructionRentalsTags()
          : this.userService
              .getConstructionSales()
              .filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
        ).slice(0, 10)
      )
    );
  };

  constructionServices = this.userService.getConstructionServices();
  selectedAdvertisementID = this.storageService?.getSelectedAdvertisementId();
  canUserEditAdvertisement$ = this.apiService
    .canUserEditAdvertisement(
      this.selectedAdvertisementID(),
      this.encryptionService.encryptItem(this.userId())
    )
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((canEdit: boolean) => {
        if (!canEdit) this.router.navigate(['/general/user-advertisements']);
      }),

      switchMap(() => {
        return this.apiService
          .getAdvertisementEditInfo(
            this.selectedAdvertisementID(),
            this.encryptionService.encryptItem(this.userId())
          )
          .pipe(
            takeUntilDestroyed(this.destroyRef),

            tap((results: any) => {
              if (results?.selectAdResult?.length < 1)
                this.router.navigate(['/general/user-advertisements']);
              else {
                this.advertisement = results[0];
                if (results[0]?.tags?.length > 0)
                  this.myTags = results[0]?.tags?.split(',');
                this.formArray.get([0]).get('tags').setValue(this.myTags);
                this.formArray.get([0]).updateValueAndValidity();

                const selectAdResult = results;
                this.sliderImages = [];

                if (results[0].headerImage) {
                  const blob = new Blob(
                    [new Uint8Array(results[0].headerImage.data)],
                    {
                      type: 'image/jpeg',
                    }
                  );

                  const temporaryFile = new File([blob], 'image.jpg', {
                    type: 'image/jpeg',
                  });

                  // Create an Image object to get the dimensions
                  const img = new Image();
                  img.src = URL.createObjectURL(blob);

                  img.onload = () => {
                    // Set the dimensions on the headerImageFile
                    temporaryFile['width'] = img.width;
                    temporaryFile['height'] = img.height;

                    // Now you can use temporaryFile with its dimensions
                    this.headerImageFile = temporaryFile;
                  };

                  // Set the header image URL
                  const imageUrl = URL.createObjectURL(blob);
                  this.advertisement.headerImageUrl = `url(${imageUrl})`;
                  this.advertisement.headerImage = imageUrl;
                }

                //this.advertisement.dateCreated = new Date();
                this.advertisement.sliderImageFiles = [];
                this.advertisement.sliderImages = [];
                selectAdResult.forEach((item) => {
                  if (item?.userAdvertisementImage) {
                    const uint8Array = new Uint8Array(
                      item?.userAdvertisementImage.data
                    );

                    // Convert Uint8Array to Blob
                    const blob = new Blob([uint8Array], {
                      type: 'image/jpeg' /* specify MIME type if known */,
                    });
                    const temporaryFile = new File([blob], 'image.jpg', {
                      type: 'image/jpeg',
                    });

                    // Create an Image object to get the dimensions
                    const img = new Image();
                    img.src = URL.createObjectURL(temporaryFile);

                    img.onload = () => {
                      // Set the dimensions on the temporaryFile
                      temporaryFile['width'] = img.width;
                      temporaryFile['height'] = img.height;

                      // Now you can use temporaryFile with its dimensions
                      this.advertisement.sliderImageFiles.push(temporaryFile);
                      this.files.push(temporaryFile);

                      const imageUrl = URL.createObjectURL(temporaryFile);
                      this.advertisement.sliderImages.push(`${imageUrl}`);
                    };
                  }
                });
              }
            })
          );
      }),
      switchMap((results: any) => {
        const advertisement = results[0];
        if (
          advertisement?.adType === 'sale' ||
          advertisement.adType === 'rental'
        )
          return this.apiService
            .getAdvertisementItems(this.selectedAdvertisementID())
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              tap((items: any) => {
                this.advertisement.items = [];

                items.forEach((item) => {
                  if (item?.itemImage) {
                    const uint8Array = new Uint8Array(item?.itemImage.data);

                    // Convert Uint8Array to Blob
                    const blob = new Blob([uint8Array], {
                      type: 'image/jpeg' /* specify MIME type if known */,
                    });
                    const temporaryFile = new File([blob], 'image.jpg', {
                      type: 'image/jpeg',
                    });

                    // Create an Image object to get the dimensions
                    const img = new Image();
                    img.src = URL.createObjectURL(temporaryFile);

                    img.onload = () => {
                      // Set the dimensions on the temporaryFile
                      temporaryFile['width'] = img.width;
                      temporaryFile['height'] = img.height;

                      // Now you can use temporaryFile with its dimensions

                      this.itemImageFiles.push(temporaryFile);
                      const imageUrl = URL.createObjectURL(temporaryFile);
                      // this.advertisement.sliderImages.push(`${imageUrl}`);
                      this.advertisement.items.push({
                        itemImage: `${imageUrl}`,
                        itemCategory: item.itemCategory,
                        itemName: item.itemName,
                        itemDescription: item.itemDescription,
                      });
                      (this.formArray?.get([1]).get('items') as FormArray).push(
                        new FormGroup({
                          itemImage: new FormControl('image', [
                            Validators.required,
                          ]),
                          itemCategory: new FormControl(item.itemCategory, [
                            Validators.required,
                          ]),
                          itemName: new FormControl(item.itemName, [
                            Validators.required,
                          ]),
                          itemDescription: new FormControl(
                            item.itemDescription,
                            [Validators.required]
                          ),
                        })
                      );
                    };
                  }
                });
              })
            );
        else return of(null);
      }),
      switchMap(() =>
        this.apiService.getApplicationSetting().pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((info: any) => {
            this.maxAdvertisementSliderImage = info.maxAdvertisementSliderImage;
            this.userAdvertisementDuration = info.userAdvertisementDuration;
          })
        )
      )
    );

  constructor(
    private sanitizer: DomSanitizer,
    private userService: UserService
  ) {
    this.advertisement.items = [];
    const adObject = this.storageService?.getAdvertisement()();
    if (
      adObject?.advertisementSelected &&
      adObject?.advertisementAction === 'edit'
    )
      this.advertisement = this.storageService?.getSelectedAdvertisement()();
    else this.advertisement = {};

    this.advertisement.sliderImages = [];

    this.advertisementCommunicationService.message$
      .pipe(first())
      .subscribe((message) => {
        const isEmpty = Object.keys(message).length === 0;
        if (!isEmpty) this.advertisement = message;
      });
    // const newDate = new Date(
    //   this.advertisement.dateCreated.getTime() - 5 * 24 * 60 * 60 * 1000
    // );
    // this.advertisement.dateCreated = newDate;

    this.canUserEditAdvertisement$.subscribe();

    this.form = this.fb.group({
      formArray: this.fb.array([
        this.fb.group({
          tags: new FormControl('', [Validators.required]),
          type: new FormControl('', [Validators.required]),
        }),
        this.fb.group({
          title: new FormControl('', [Validators.required]),
          description: new FormControl('', [Validators.required]),
          headerImage: new FormControl('', []),
          jobQualifications: new FormControl('', []),
          jobBenefits: new FormControl('', []),
          jobRequirements: new FormControl('', []),
          jobHowToApply: new FormControl('', []),
          jobDuration: new FormControl('', []),
          jobSalary: new FormControl('', []),
          jobShifts: new FormControl('', []),
          jobLocation: new FormControl('', []),
          jobType: new FormControl('', []),
          jobResponsibilities: new FormControl('', []),
          items: new FormArray([]),
        }),
        this.fb.group({
          showPhone: new FormControl('', []),
          showAddress: new FormControl('', []),
          showEmail: new FormControl('', []),
          showPicture: new FormControl('', []),
          showChat: new FormControl('', []),
          sliderImages: new FormArray([]),
        }),
        this.fb.group({
          sliderImages: new FormArray([]),
        }),
      ]),
    });
    this.setFilterTags();
  }
  setTags() {
    if (this.advertisement?.adType === 'service')
      this.constructionServices = this.userService.getConstructionServices();
    else if (this.advertisement?.adType === 'rental') {
      (this.formArray?.get([1]).get('items') as FormArray).clear();
      (this.formArray?.get([1]).get('items') as FormArray).patchValue([]);
      this.constructionServices = this.userService.getConstructionRentalsTags();
    } else if (this.advertisement?.adType === 'job')
      this.constructionServices = this.userService.getConstructionJobs();
    else if (this.advertisement?.adType === 'sale') {
      (this.formArray?.get([1]).get('items') as FormArray).clear();
      (this.formArray?.get([1]).get('items') as FormArray).patchValue([]);
      this.constructionServices = this.userService.getConstructionSales();
    }

    this.setFilterTags();
  }
  setFilterTags() {
    this.filteredTags = this.tagCtrl?.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filterTags(item) : this.constructionServices.slice()
      )
    );
  }
  itemImageFiles: File[] = [];
  itemImageHandler(event: any, index: number): void {
    const itemImageFile = event?.target?.files[0];

    if (itemImageFile) {
      const fileType = itemImageFile?.name?.split('.')?.pop()?.toLowerCase();
      const allowedFileTypes = this.commonUtility._imageMimeTypes;
      const maxFileSize = this.commonUtility._advertisementHeaderMaxSize;

      // Check file type
      if (fileType && !allowedFileTypes?.includes(fileType)) {
        this.handleImageError(
          'Selected file type is not allowed. Please select a file with one of the following extensions: ' +
            allowedFileTypes.join(', '),
          'Wrong File Type'
        );

        this.getItemsFormArrayControls()[index].get('itemImage').setValue('');
        return;
      }

      // Check file size
      if (itemImageFile.size === 0 || itemImageFile.size > maxFileSize) {
        this.handleImageError(
          `File size can not be empty and cannot exceed the maximum limit of ${this.utilityService.convertBytesToKbOrMb(
            maxFileSize
          )}`,
          'Wrong File Size'
        );
        this.getItemsFormArrayControls()[index].get('itemImage').setValue('');
        return;
      }

      // Check image dimensions
      const [minWidth, maxWidth] =
        this.commonUtility._advertisementHeaderMinMaxWidthHeightPixel[0];
      const [minHeight, maxHeight] =
        this.commonUtility._advertisementHeaderMinMaxWidthHeightPixel[1];

      const img = new Image();
      img.src = URL.createObjectURL(itemImageFile);

      img.onload = () => {
        const imageWidth = img.width;
        // this.imageWidth = img.width;
        const imageHeight = img.height;
        // this.imageHeight = img.height;

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
          this.getItemsFormArrayControls()[index].get('itemImage').setValue('');
        } else {
          // Image is within the specified dimensions
          // this.advertisement.headerImageUrl = `url(${img.src})`;
          // this.advertisement.headerImage = img.src;
          // this.headerImageFile = headerImageFile;
          // this.getItemsFormArrayControls()[index].get('itemImage').setValue('');
          // file ok

          // this.getItemsFormArrayControls()
          //   [index].get('itemImage')
          //   .setValue(itemImageFile);
          this.itemImageFiles.push(itemImageFile);
          this.advertisement.items[index].itemImage = img.src;
        }
      };
    }
  }
  removeItemsFormGroup(index: number) {
    (this.formArray?.get([1]).get('items') as FormArray).removeAt(index);
    this.itemImageFiles.splice(index, 1);
    this.advertisement.items.splice(index, 1);

    // Remove the form group from the FormArray

    // this.advertisement.sliderImages?.splice(index, 1);
    //this.sliderImages?.splice(index, 1);
  }
  addClientFormControl() {
    if (!this.advertisement.items) this.advertisement.items = [];
    this.advertisement.items.push({
      itemImage: '',
      itemCategory: '',
      itemName: '',
      itemDescription: '',
    });
    (this.formArray?.get([1]).get('items') as FormArray).push(
      new FormGroup({
        itemImage: new FormControl('', [Validators.required]),
        itemCategory: new FormControl('', [Validators.required]),
        itemName: new FormControl('', [Validators.required]),
        itemDescription: new FormControl('', [Validators.required]),
      })
    );
  }
  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.constructionServices.filter((item) =>
      item.toLowerCase().includes(filterValue)
    );
  }

  getObjectURL(file: File): SafeUrl {
    if (file)
      return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    else return null;
  }
  get formArray(): AbstractControl | null {
    return this.form?.get('formArray');
  }

  goForward(stepper: MatStepper, index: number) {
    this.formErrors = this.formService.getFormValidationErrorMessages(
      this.formArray?.get([index]) as FormGroup
    );
    stepper.next();
  }

  preview() {
    this.advertisementCommunicationService.sendMessage(this.advertisement);
    this.router.navigate(['/general/preview-advertisement']);
  }
  deleteHeaderImage() {
    this.headerImageFile = null;
    this.advertisement.headerImage = null;
    this.advertisement.headerImageUrl = null;
  }
  getItemsFormArrayControls() {
    return (this.formArray?.get([1]).get('items') as FormArray).controls;
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
        } else {
          // Image is within the specified dimensions
          this.advertisement.headerImageUrl = `url(${img.src})`;
          this.advertisement.headerImage = img.src;
          this.headerImageFile = headerImageFile;
          this.headerImageFile['width'] = imageWidth;
          this.headerImageFile['height'] = imageHeight;
        }
      };
    }
  }

  submit() {
    if (this.form.valid) {
      const userId = this.storageService?.getUserId();
      const formData = new FormData();
      formData.append('userId', this.encryptionService.encryptItem(userId()));
      formData.append(
        'userAdvertisementId',
        this.advertisement?.userAdvertisementId
      );
      if (this.headerImageFile)
        formData.append(
          'headerImage',
          this.headerImageFile,
          this.headerImageFile.name
        );
      else formData.append('headerImage', '');
      formData.append('tags', this.myTags.join(', '));

      if (this.advertisement.sliderImageFiles) {
        for (const file of this.advertisement.sliderImageFiles) {
          formData.append('sliderImages', file, file.name);
        }
      } else formData.append('sliderImages', '');
      if (this.getItemsFormArrayControls()?.length > 0) {
        for (const [
          index,
          item,
        ] of this.getItemsFormArrayControls().entries()) {
          formData.append(
            'itemImages',
            this.itemImageFiles[index],
            this.itemImageFiles[index].name
          );

          formData.append('itemCategorys', item?.get('itemCategory').value);
          formData.append('itemNames', item?.get('itemName').value);
          formData.append(
            'itemDescriptions',
            item?.get('itemDescription').value
          );
        }
      } else formData.append('itemImages', '');

      formData.append('title', this.advertisement?.title);
      formData.append('description', this.advertisement?.description);

      formData.append(
        'showPhone',
        `${this.advertisement?.showPhone ? '1' : '0'}`
      );
      formData.append(
        'showAddress',
        `${this.advertisement?.showAddress ? '1' : '0'}`
      );
      formData.append(
        'showEmail',
        `${this.advertisement?.showEmail ? '1' : '0'}`
      );
      formData.append(
        'showPicture',
        `${this.advertisement?.showPicture ? '1' : '0'}`
      );
      formData.append(
        'showChat',
        `${this.advertisement?.showChat ? '1' : '0'}`
      );
      formData.append(
        'jobQualifications',
        this.advertisement?.jobQualifications
      );
      formData.append('jobBenefits', this.advertisement?.jobBenefits);
      formData.append('jobRequirements', this.advertisement?.jobRequirements);
      formData.append('jobHowToApply', this.advertisement?.jobHowToApply);
      formData.append('jobDuration', this.advertisement?.jobDuration);
      formData.append('jobSalary', this.advertisement?.jobSalary);
      formData.append('jobShifts', this.advertisement?.jobShifts);
      formData.append('jobLocation', this.advertisement?.jobLocation);
      formData.append(
        'jobResponsibilities',
        this.advertisement?.jobResponsibilities
      );
      formData.append('adType', this.advertisement?.adType);
      formData.append('jobType', this.advertisement.jobType);

      this.apiService
        .editAdvertisement(formData)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.router.navigate(['/general/user-advertisements']);
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
    const remainingSlots = this.maxAdvertisementSliderImage - this.files.length;

    if (remainingSlots <= 0) {
      this.toastService.error(
        `You can upload only ${this.maxAdvertisementSliderImage} images`,
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
    if (this.myTags?.includes(value))
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
