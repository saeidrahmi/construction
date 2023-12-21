import { EncryptionService } from '../../services/encryption-service';
import { AsyncPipe, CommonModule } from '@angular/common';
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
import {
  BehaviorSubject,
  Observable,
  interval,
  map,
  startWith,
  take,
  tap,
} from 'rxjs';
import { ApiService } from '../../services/api.service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { ImageService } from '../../services/image-service';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user-service';
import { AdvertisementViewComponent } from '../../common-components/advertisement/advertisement-view/advertisement-view.component';
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
import { FormErrorsComponent } from '../form-errors.component';
import { FormService } from '../../services/form.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationModule } from 'ngx-bootstrap/pagination';
@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css'],
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
    FormErrorsComponent,
    NgxPaginationModule,
    AsyncPipe,
    PaginationModule,
  ],
  providers: [],
})
export class JobListComponent {
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filters: string[] = [];
  myTags: string[] = [];
  pageFilter = 1;
  pageTop = 1;
  pageSize = 5;
  formErrors: string[] = [];
  myLocations: string[] = [];
  announcer = inject(LiveAnnouncer);
  tagCtrl = new FormControl('');
  locationCtrl = new FormControl('');
  router = inject(Router);
  imageService = inject(ImageService);
  sortBy = '';
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
  filteredAdvertisements: any[] = [];
  filteredTopAdvertisements: any[] = [];
  user = this.storageService?.getUser();
  userId = this.storageService?.getUserId();
  loggedIn = this.storageService?.isUserLoggedIn();
  currentPosition: any;
  address!: string;
  currentDate = new Date();
  searchForm: FormGroup;
  canadaCites: string[] = [];
  citiesByProvince = {};
  ratingFilter = [];
  tagsCategorized: { tag: string; count: number }[] = [];
  itemsPerPage = 5;

  configFilter: any = {
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: this.filteredAdvertisements?.length,
  };
  pageChangedTop(event: any, target: string): void {
    this[target] = event.page;
  }
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private formService: FormService
  ) {
    if (
      this.storageService.getMapSearchSelectedCities()() &&
      this.storageService.getSearchPreviousPage()() === 'jobs'
    )
      this.myLocations = this.storageService.getMapSearchSelectedCities()();
    // this.getCurrentLocation();
    this.searchForm = this.fb.group({
      searchText: new FormControl('', []),
      tags: new FormControl('', []),
      //currentAddress: new FormControl('', []),

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
          this.canadaCites.unshift('Canada-wide');
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
        this.encryptionService.encryptItem(this.userId()),
        'job'
      )
      .pipe(
        takeUntilDestroyed(),
        tap((list: any) => {
          this.allAdvertisements = list;
          this.convertImages();
          this.filteredAdvertisements = this.allAdvertisements.filter(
            (item) => item.topAdvertisement === 0
          );
          this.filteredTopAdvertisements = this.allAdvertisements.filter(
            (item) => item.topAdvertisement === 1
          );

          this.categorizeLocations(this.allAdvertisements);
          this.categorizeRatings(this.allAdvertisements);
          this.categorizeTags(this.allAdvertisements);
          if (this.storageService.getAdvertisementSearchFilters()()?.length > 0)
            this.filterResults();
        })
      )
      .subscribe();
    interval(10000) // 10 seconds interval
      .pipe(takeUntilDestroyed()) // execute only once for demonstration purposes
      .subscribe(() => {
        this.moveLastToBeginning();
      });
    this.filteredTags = this.tagCtrl?.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filterTags(item) : this.constructionServices.slice()
      )
    );
  }
  navigateSelectFromMap() {
    this.storageService.setSearchPreviousPage('jobs');
    this.router.navigate(['map-location']);
  }

  moveLastToBeginning() {
    if (this.filteredTopAdvertisements.length > 2) {
      const lastItem = this.filteredTopAdvertisements.pop(); // Remove the last item
      this.filteredTopAdvertisements.unshift(lastItem); // Add it to the beginning
    }
  }
  pageChangedFilter(event: number, config: any): void {
    config.currentPage = event;
  }
  rateFilter(item, rate) {
    let userRating = parseFloat(item.average_userOverallRating);
    // Check for null, empty, or non-numeric values
    if (isNaN(userRating) || userRating === null) {
      // Handle the case when average_userOverallRating is null or NaN
      userRating = 0;
    }
    // Your original condition
    return rate <= userRating;
  }

  provinceFilter(item, province) {
    return item.province === province;
  }
  tagFilter(item, tag) {
    return item?.tags?.toLowerCase()?.includes(tag?.toLowerCase());
  }

  locationFilter(
    item: {
      province: string;
      city: string;
      // ... other properties of your item
    },
    province: string,
    city: string
  ): boolean {
    // Your existing logic for location filtering

    return item.province === province && item.city === city;
  }

  remove(filter: string): void {
    const index = this.storageService
      .getAdvertisementSearchFilters()()
      .indexOf(filter);
    if (index >= 0) {
      // this.filters.splice(index, 1);
      this.announcer.announce(`Removed ${filter}`);
      this.storageService.removeAdvertisementSearchFilters(filter);
      this.filterResults();
    }
  }

  categorizeRatings(advertisements: any[]) {
    // Iterate through the data and categorize the ratings
    this.ratingFilter = [
      { rating: 10, count: 0 },
      { rating: 9, count: 0 },
      { rating: 8, count: 0 },
      { rating: 7, count: 0 },
      { rating: -1, count: 0 }, // for any rating
    ];

    advertisements.forEach((item) => {
      let userRating = parseFloat(item.average_userOverallRating);

      if (isNaN(userRating) || userRating === null) {
        userRating = 1; // Assign it to "any rating" category

        //this.ratingFilter.find((category) => category.rating === -1).count += 1;
      }

      for (const category of this.ratingFilter) {
        if (userRating >= category.rating || category.rating === -1) {
          category.count += 1;
        }
      }
    });
  }
  categorizeTags(advertisements: any[]) {
    this.tagsCategorized = [];

    // Iterate through the data and organize cities by province

    advertisements.forEach((item) => {
      const tags = item.tags?.split(', ');
      tags?.forEach((tag) => {
        const existingTag = this.tagsCategorized.find(
          (entry) => entry.tag === tag
        );
        if (existingTag) {
          existingTag.count++;
        } else {
          this.tagsCategorized.push({ tag: tag, count: 1 });
        }
      });
    });
  }

  categorizeLocations(advertisements: any[]) {
    this.citiesByProvince = {};

    // Iterate through the data and organize cities by province
    advertisements.forEach((item) => {
      const province = item.province;
      const city = item.city;

      // Check if the province already exists
      if (!this.citiesByProvince[province]) {
        this.citiesByProvince[province] = {
          cities: [{ cityName: city, count: 1 }],
          count: 1,
        };
      } else {
        const existingCity = this.citiesByProvince[province].cities.find(
          (c) => c.cityName === city
        );

        if (existingCity) {
          existingCity.count += 1;
        } else {
          this.citiesByProvince[province].cities.push({
            cityName: city,
            count: 1,
          });
        }

        this.citiesByProvince[province].count += 1;
      }
    });
  }

  clearAddrress() {
    this.myLocations = [];
    this.storageService.clearMapSearchSelectedCities();
  }

  // getCurrentLocation() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position: any) => {
  //         this.currentPosition = position;
  //         this.getAddressFromCoordinates();
  //       },
  //       (error: any) => {
  //         //    console.error('Error getting location:', error);
  //       }
  //     );
  //   } else {
  //     // console.error('Geolocation is not supported by this browser.');
  //   }
  // }

  // getAddressFromCoordinates() {
  //   const geocoder = new google.maps.Geocoder();
  //   const latlng = new google.maps.LatLng(
  //     this.currentPosition.coords.latitude,
  //     this.currentPosition.coords.longitude
  //   );

  //   geocoder.geocode({ location: latlng }, (results: any, status: any) => {
  //     this.googleAddresses = results;
  //     if (status === 'OK') {
  //       if (results[0]) {
  //         this.address = results[0].formatted_address;
  //         this.addressObject = results[0];
  //       } else {
  //         // this.address = 'Address not found';
  //       }
  //     } else {
  //       // console.error('Geocoder failed due to: ' + status);
  //     }
  //   });
  // }
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
  convertImages() {
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
  }
  search() {
    if (this.searchForm.valid) {
      this.storageService.clearAdvertisementSearchFilters();
      const data = {
        searchText: this.searchForm.get('searchText').value,
        tags: this.myTags,
        //currentAddress: new FormControl('', []),
        locations: this.myLocations,
        sortBy: this.sortBy,
      };
      this.apiService
        .searchAdvertisements(
          this.loggedIn(),
          this.encryptionService.encryptItem(this.userId()),
          data,
          'job'
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),

          tap((list: any) => {
            this.allAdvertisements = list;
            this.convertImages();

            this.filteredAdvertisements = this.allAdvertisements.filter(
              (item) => item.topAdvertisement === 0
            );
            this.filteredTopAdvertisements = this.allAdvertisements.filter(
              (item) => item.topAdvertisement === 1
            );
            this.categorizeLocations(this.allAdvertisements);
            this.categorizeRatings(this.allAdvertisements);
            this.categorizeTags(this.allAdvertisements);
          })
        )
        .subscribe();
    } else {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.searchForm
      );
    }
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
  filterCity(city: string, province: string) {
    const cityStr = 'Location (' + province + ', ' + city + ')';

    this.storageService.updateAdvertisementSearchFilters(cityStr, province);
  }
  filterCategory(tag: string) {
    const tagStr = 'Category (' + tag + ')';
    this.storageService.updateAdvertisementSearchFilters(tagStr, null);
  }
  clearAllFilters() {
    this.filteredAdvertisements = this.allAdvertisements.filter(
      (item) => item.topAdvertisement === 0
    );
    this.filteredTopAdvertisements = this.allAdvertisements.filter(
      (item) => item.topAdvertisement === 1
    );
    this.storageService.clearAdvertisementSearchFilters();
    this.categorizeLocations(this.filteredAdvertisements);
    this.categorizeRatings(this.filteredAdvertisements);
  }
  filterProvince(province: string) {
    const provinceStr = 'Province (' + province + ')';
    this.storageService.updateAdvertisementSearchFilters(provinceStr, province);
  }
  filterRating(rate: number) {
    //this.filters = this.filters.filter((item) => !item.includes('Rating'));
    const rating = rate === 0 ? 'All ratings' : rate;
    // this.filters.push('Rating (' + rating + ')');
    this.storageService.updateAdvertisementSearchFilters(
      'Rating (' + rating + ')',
      null
    );
  }
  filterResults() {
    const filters = this.storageService.getAdvertisementSearchFilters()();
    if (filters?.length > 0) {
      const ratingFilter = filters.find((filter) => filter.includes('Rating'));

      const provinceFilters = filters.filter((filter) =>
        filter.includes('Province')
      );
      const locationFilters = filters.filter((filter) =>
        filter.includes('Location')
      );

      const tagsFilters = filters.filter((filter) =>
        filter.includes('Category')
      );
      // Extract values from filters
      let rate = 0;
      if (ratingFilter === 'Rating (All ratings)') rate = -1;
      else
        rate = ratingFilter
          ? parseFloat(ratingFilter.match(/\(([^)]+)\)/)[1])
          : null;
      // Additional checks for the existence of filters
      const hasRatingFilter = ratingFilter?.length > 0;
      const hasProvinceFilter = provinceFilters?.length > 0;
      const hasLocationFilter = locationFilters?.length > 0;
      const hasTagsFilter = tagsFilters?.length > 0;
      // Apply the filters
      this.filteredAdvertisements = this.allAdvertisements.filter((item) => {
        const isRatingMatch = rate && this.rateFilter(item, rate);
        const isTagMatch =
          hasTagsFilter &&
          tagsFilters.some(
            (tagFilter) =>
              !tagFilter ||
              this.tagFilter(item, tagFilter.match(/\(([^)]+)\)/)[1])
          );
        const isProvinceMatch =
          hasProvinceFilter &&
          provinceFilters.some(
            (provinceFilter) =>
              !provinceFilter ||
              this.provinceFilter(item, provinceFilter.match(/\(([^)]+)\)/)[1])
          );

        const isLocationMatch =
          hasLocationFilter &&
          locationFilters.some((locationFilter) =>
            this.locationFilter(
              item,
              ...(locationFilter.match(/\(([^,]+),\s*([^)]+)\)/).slice(1) as [
                string,
                string
              ])
            )
          );
        if (
          hasRatingFilter &&
          (hasProvinceFilter || hasLocationFilter) &&
          hasTagsFilter
        ) {
          return (
            isRatingMatch && (isProvinceMatch || isLocationMatch) && isTagMatch
          );
        } else if (
          hasRatingFilter &&
          (hasProvinceFilter || hasLocationFilter) &&
          !hasTagsFilter
        ) {
          return isRatingMatch && (isProvinceMatch || isLocationMatch);
        } else if (
          hasRatingFilter &&
          (!hasProvinceFilter || !hasLocationFilter) &&
          hasTagsFilter
        ) {
          return isRatingMatch && isTagMatch;
        } else if (
          !hasRatingFilter &&
          !(hasProvinceFilter || hasLocationFilter) &&
          hasTagsFilter
        ) {
          return isTagMatch;
        } else if (
          !hasRatingFilter &&
          (hasProvinceFilter || hasLocationFilter) &&
          hasTagsFilter
        ) {
          return isTagMatch && (isProvinceMatch || isLocationMatch);
        } else
          return (
            isRatingMatch || isProvinceMatch || isLocationMatch || isTagMatch
          );
      });
      this.filteredTopAdvertisements = this.filteredAdvertisements.filter(
        (item) => item.topAdvertisement === 1
      );
      this.filteredAdvertisements = this.filteredAdvertisements.filter(
        (item) => item.topAdvertisement === 0
      );
    } else this.clearAllFilters();

    // this.categorizeLocations(this.filteredAdvertisements);
    // this.categorizeRatings(this.filteredAdvertisements);
  }
}
