import { UserService } from './../../services/user-service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, startWith, map, catchError, of, tap, first } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'construction-user-services',
  templateUrl: './user-services.component.html',
  styleUrls: ['./user-services.component.scss'],
})
export class UserServicesComponent {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  serviceCtrl = new FormControl('');
  filteredServices: Observable<string[]>;
  myServices: string[] = [];
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  constructionServices: string[] = [];
  @ViewChild('serviceInput') serviceInput!: ElementRef<HTMLInputElement>;
  announcer = inject(LiveAnnouncer);
  constructor(
    private userService: UserService,
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    this.constructionServices = this.userService.getConstructionServices();
    this.apiService
      .getUserServices(this.storageService?.getUserId()())
      .pipe(first())
      .subscribe(
        (list: string[]) => {
          this.myServices = list;
          console.log(list, 'list');
        },
        (err) => {
          this.toastService.error(
            'Failed getting user servcies due to server error. ' + err,
            'No update',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(err);
        }
      );
    this.filteredServices = this.serviceCtrl.valueChanges.pipe(
      startWith(null),
      map((item: string | null) =>
        item ? this._filter(item) : this.constructionServices.slice()
      )
    );
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && this.myServices.includes(value)) {
      this.toastService.error('Service already added. ', 'No update', {
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
          }),
          catchError((err) => {
            this.toastService.error(
              'Update failed due to server error. ' + err,
              'No update',
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
    }

    // Clear the input value
    event.chipInput!.clear();

    this.serviceCtrl.setValue(null);
  }

  remove(item: string): void {
    const index = this.myServices.indexOf(item);
    if (index >= 0) {
      this.myServices.splice(index, 1);
      this.apiService
        .removeUserServices(this.storageService?.getUserId()(), item)
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
          }),
          catchError((err) => {
            this.toastService.error(
              'Update failed due to server error. ' + err,
              'No update',
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
      this.announcer.announce(`Removed ${item}`);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (this.myServices.includes(value))
      this.toastService.error('Service already added. ', 'No update', {
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
          }),
          catchError((err) => {
            this.toastService.error(
              'Update failed due to server error. ' + err,
              'No update',
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
    }
    this.serviceInput.nativeElement.value = '';
    this.serviceCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.constructionServices.filter((item) =>
      item.toLowerCase().includes(filterValue)
    );
  }
}
