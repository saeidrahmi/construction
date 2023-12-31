import { HttpClient } from '@angular/common/http';
import { UserService } from './../../services/user-service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map, tap, take } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { CommonUtilityService } from '../../services/common-utility.service';
import { ThemePalette } from '@angular/material/core';
import { CountryInterface } from '../../models/country';
import { EncryptionService } from '../../services/encryption-service';
import { CanadaInterface } from '../../models/canada';
export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}
@Component({
  selector: 'construction-user-services',
  templateUrl: './user-services.component.html',
  styleUrls: ['./user-services.component.scss'],
})
export class UserServicesComponent {
  cities = signal<string[]>([]);
  separatorKeysCodes: number[] = [ENTER, COMMA];
  storageService = inject(StorageService);
  serviceCtrl = new FormControl('');
  cityCtrl = new FormControl('');
  provinceCtrl = new FormControl('');
  filteredServices: Observable<string[]>;
  filteredCities: Observable<string[]>;
  filteredProvinces: Observable<string[]>;
  myServices: string[] = [];
  myCites: string[] = [];
  myProvinces: string[] = [];
  destroyRef = inject(DestroyRef);
  commonUtility = inject(CommonUtilityService);
  encryptionService = inject(EncryptionService);

  toastService = inject(ToastrService);
  selectedCity = '';
  locationType = '';
  selectedProvince = '';
  selectedProvinces: string[] = [];
  constructionServices: string[] = [];
  @ViewChild('serviceInput') serviceInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cityInput') cityInput!: ElementRef<HTMLInputElement>;
  @ViewChild('provinceInput') provinceInput!: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);
  cityControl = new FormControl('');
  canadaInfo: CountryInterface[] = [];
  form: FormGroup;
  countryWide: boolean;
  http = inject(HttpClient);
  canadaData: CanadaInterface[] = [];
  canadaProvinces: string[] = [];
  canadaCites: string[] = [];
  constructor(
    private userService: UserService,
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.http
      .get<CanadaInterface[]>('../../assets/canadian-cities.json')
      .pipe(
        take(1),
        takeUntilDestroyed(),
        tap((response) => {
          const data = JSON.parse(JSON.stringify(response));
          this.canadaData = data;
          this.canadaProvinces = this.canadaData.map((entry) => entry.province);
          this.canadaCites = this.getCities(data);
        })
      )
      .subscribe();
    this.form = this.fb.group({
      city: new FormControl(),
      countryWide: new FormControl(),
    });
    this.constructionServices = this.userService.getConstructionServices();
    this.apiService
      .getUserServices(this.storageService?.getUserId()())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list: string[]) => {
        this.myServices = list;
      });
    this.apiService
      .getUserServiceLocations(this.storageService?.getUserId()())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((info: any) => {
        this.locationType = info.serviceCoverageType;
        if (this.locationType === 'province') {
          this.myProvinces = info.provinces;
        }
        if (this.locationType === 'city') {
          this.myCites = info.cities;
        }
      });
    this.filteredServices = this.serviceCtrl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filterService(item) : this.constructionServices.slice()
      )
    );
    this.filteredCities = this.cityCtrl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filterCity(item) : this.canadaCites.slice()
      )
    );
    this.filteredProvinces = this.cityCtrl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filterProvince(item) : this.canadaProvinces.slice()
      )
    );
  }
  getCities(data: any[]): string[] {
    const citiesList: string[] = [];

    for (const entry of data) {
      const cities = entry.cities;

      // Add each city to the list
      citiesList.push(...cities);
    }

    return citiesList;
  }

  addService(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && this.myServices.includes(value)) {
      this.toastService.error('Service exists. ', 'Error', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
    }
    // Add service
    else {
      this.myServices.push(value);
      this.apiService
        .addUserServices(this.storageService?.getUserId()(), value)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success(
              'Services updated.',
              'Update Successful',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
          })
        )
        .subscribe();
    }

    // Clear the input value
    event.chipInput!.clear();

    this.serviceCtrl.setValue(null);
  }

  removeService(item: string): void {
    const index = this.myServices.indexOf(item);
    if (index >= 0) {
      this.myServices.splice(index, 1);
      this.apiService
        .removeUserServices(this.storageService?.getUserId()(), item)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success('Services removed.', 'Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          })
        )
        .subscribe();
      this.announcer.announce(`Removed ${item}`);
    }
  }

  selectedService(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (this.myServices.includes(value))
      this.toastService.error('Service exist. ', 'Error', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
    else {
      this.myServices.push(value);
      this.apiService
        .addUserServices(
          this.storageService?.getUserId()(),
          event.option.viewValue
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success(
              'Services updated.',
              'Update Successful',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
          })
        )
        .subscribe();
    }
    this.serviceInput.nativeElement.value = '';
    this.serviceCtrl.setValue(null);
  }

  addCity(event: MatChipInputEvent): void {
    alert('Adding city not allowed. Please select from the list.');
    event.chipInput!.clear();
    this.cityCtrl.setValue(null);
  }

  removeCity(item: string): void {
    const index = this.myCites.indexOf(item);
    if (index >= 0) {
      this.myCites.splice(index, 1);

      this.announcer.announce(`Removed ${item}`);
    }
  }

  selectCity(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (this.myCites.includes(value))
      this.toastService.error('City already added. ', 'No update', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
    else {
      this.myCites.push(value);
    }
    this.cityInput.nativeElement.value = '';
    this.cityCtrl.setValue(null);
  }
  addProvince(event: MatChipInputEvent): void {
    alert('Adding new province not allowed. Please select from the list.');
    event.chipInput!.clear();
    this.provinceCtrl.setValue(null);
  }

  removeProvince(item: string): void {
    const index = this.myProvinces.indexOf(item);
    if (index >= 0) {
      this.myProvinces.splice(index, 1);
      this.announcer.announce(`Removed ${item}`);
    }
  }

  selectProvince(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (this.myProvinces.includes(value))
      this.toastService.error('Province already added. ', 'No update', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
    else {
      this.myProvinces.push(value);
    }
    this.provinceInput.nativeElement.value = '';
    this.provinceCtrl.setValue(null);
  }

  private _filterService(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.constructionServices.filter((item) =>
      item.toLowerCase().includes(filterValue)
    );
  }
  private _filterCity(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.canadaCites.filter((item) =>
      item.toLowerCase().includes(filterValue)
    );
  }
  private _filterProvince(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.canadaProvinces.filter((item) =>
      item.toLowerCase().includes(filterValue)
    );
  }
  submitCountryWide(): void {
    this.apiService
      .updateUserServiceLocationType(
        this.encryptionService.encryptItem(this.storageService?.getUserId()()),
        'country'
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.toastService.success(
            'Location type updated.',
            'Update Successful',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
        })
      )
      .subscribe();
  }
  submitProvinceWide(): void {
    this.apiService
      .updateUserServiceProvinces(
        this.encryptionService.encryptItem(this.storageService?.getUserId()()),
        this.myProvinces
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.toastService.success('Provinces updated.', 'Update Successful', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        })
      )
      .subscribe();
  }
  submitCities(): void {
    const outputArray = this.myCites.map((item) => {
      const [city, province] = item.match(/^(.*?)\s+\((.*?)\)$/).slice(1);
      return { city, province };
    });

    this.apiService
      .updateUserServiceCities(
        this.encryptionService.encryptItem(this.storageService?.getUserId()()),
        outputArray
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.toastService.success('Cities updated.', 'Update Successful', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        })
      )
      .subscribe();
  }
}
