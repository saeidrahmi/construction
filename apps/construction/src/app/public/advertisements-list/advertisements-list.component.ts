import { EncryptionService } from './../../services/encryption-service';
import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, startWith, take, tap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { ImageService } from '../../services/image-service';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user-service';
import { AdvertisementViewComponent } from '../../common-components/advertisement-view/advertisement-view.component';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CanadaInterface } from '../../models/canada';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-advertisements-list',
  templateUrl: './advertisements-list.component.html',
  styleUrls: ['./advertisements-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RatingModule,
    FormsModule,
    AdvertisementViewComponent,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
})
export class AdvertisementsListComponent {
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  myTags: string[] = [];
  myLocations: string[] = [];
  announcer = inject(LiveAnnouncer);
  tagCtrl = new FormControl('');
  locationCtrl = new FormControl('');
  router = inject(Router);
  imageService = inject(ImageService);
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  userService = inject(UserService);
  storageService = inject(StorageService);
  commonUtility = inject(CommonUtilityService);
  googleAddresses!: any;
  addressObject!: any;
  destroyRef = inject(DestroyRef);
  filteredTags: Observable<string[]>;
  filteredLocations: Observable<string[]>;
  constructionServices = this.userService.getConstructionServices();
  allAdvertisements: any[] = [];
  user = this.storageService?.getUser();
  userId = this.storageService?.getUserId();
  loggedIn = this.storageService?.isUserLoggedIn();
  currentDate = new Date();
  searchForm: FormGroup;
  canadaCites: string[] = [];
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.getCurrentLocation();
    this.searchForm = this.fb.group({
      searchText: new FormControl('', [Validators.required]),
      tags: new FormControl('', []),
      currentAddress: new FormControl('', []),

      locations: new FormControl('', []),
      sortBy: new FormControl('Sort by', []),
    });
    this.http
      .get<CanadaInterface[]>('../../assets/canadian-cities.json')
      .pipe(
        take(1),
        takeUntilDestroyed(),
        tap((response) => {
          const data = JSON.parse(JSON.stringify(response));
          const canadaData = data;
          this.canadaCites = this.transformData(canadaData);
          this.filteredLocations = this.locationCtrl?.valueChanges.pipe(
            startWith(null),
            map((item: string | null) =>
              item ? this._filterLocations(item) : this.canadaCites.slice()
            )
          );
        })
      )
      .subscribe();
    this.apiService
      .getAllAdvertisements(
        this.loggedIn(),
        this.encryptionService.encryptItem(this.userId())
      )
      .pipe(
        takeUntilDestroyed(),

        tap((list: any) => {
          this.allAdvertisements = list;

          this.allAdvertisements = this.allAdvertisements.map((obj) => {
            if (obj?.headerImage) {
              const blob = new Blob([new Uint8Array(obj.headerImage.data)], {
                type: 'image/jpeg',
              }); // Adjust 'image/jpeg' to the correct image MIME type
              const imageUrl = URL.createObjectURL(blob);
              return { ...obj, headerImage: `url(${imageUrl})` };
            }
            return obj;
          });
        })
      )
      .subscribe();
    this.filteredTags = this.tagCtrl?.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filterTags(item) : this.constructionServices.slice()
      )
    );
  }
  currentPosition: any;
  address!: string;
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          this.currentPosition = position;
          this.getAddressFromCoordinates();
        },
        (error: any) => {
          //    console.error('Error getting location:', error);
        }
      );
    } else {
      // console.error('Geolocation is not supported by this browser.');
    }
  }

  getAddressFromCoordinates() {
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(
      this.currentPosition.coords.latitude,
      this.currentPosition.coords.longitude
    );

    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
      this.googleAddresses = results;
      if (status === 'OK') {
        if (results[0]) {
          this.address = results[0].formatted_address;
          this.addressObject = results[0];
        } else {
          // this.address = 'Address not found';
        }
      } else {
        // console.error('Geocoder failed due to: ' + status);
      }
    });
  }
  transformData(data: any[]): string[] {
    const transformedList: string[] = [];

    for (const entry of data) {
      const { province, cities } = entry;

      // Add the province to the list
      transformedList.push(province);

      // Add each city along with the province to the list
      for (const city of cities) {
        transformedList.push(`${province}, ${city}`);
      }
    }

    return transformedList;
  }
  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.constructionServices.filter((item) =>
      item.toLowerCase().includes(filterValue)
    );
  }
  private _filterLocations(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.canadaCites.filter((item) =>
      item.toLowerCase().includes(filterValue)
    );
  }
  search() {
    console.log(this.searchForm.value);
  }
  addTag(event: MatChipInputEvent): void {
    // Clear the input value
    event.chipInput!.clear();

    this.tagCtrl.setValue(null);
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
  }
  addLocation(event: MatChipInputEvent): void {
    // Clear the input value
    event.chipInput!.clear();
    this.locationCtrl.setValue(null);
  }

  removeLocation(item: string): void {
    const index = this.myLocations.indexOf(item);
    if (index >= 0) {
      this.myLocations.splice(index, 1);

      this.announcer.announce(`Removed ${item}`);
    }
  }

  selectedLocation(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (this.myLocations.includes(value))
      this.toastService.error('Tag exist. ', 'Error', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
    else {
      this.myLocations.push(value);
    }
    this.locationInput.nativeElement.value = '';
    this.locationCtrl.setValue(null);
  }
}
