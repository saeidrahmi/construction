import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { EncryptionService } from '../../services/encryption-service';
import { FormService } from '../../services/form.service';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take, tap, catchError, of, switchMap } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-user-favorite-ads-messages',
  templateUrl: './user-favorite-ads.component.html',
  styleUrls: ['./user-favorite-ads.component.css'],
})
export class UserFavoriteAdvertisementsComponent {
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  apiService = inject(ApiService);
  route = inject(ActivatedRoute);
  formService = inject(FormService);
  destroyRef = inject(DestroyRef);
  encryptionService = inject(EncryptionService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  user = this.storageService.getUser();
  userId = this.storageService?.getUserId();
  displayedColumns: string[] = ['userAdvertisementId', 'action'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource!: MatTableDataSource<any>;
  getFavoriteAdvertisements$ = this.apiService
    .getFavoriteAdvertisements(
      this.encryptionService.encryptItem(this.userId())
    )
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      take(1),
      tap((messages: any) => {
        this.dataSource = new MatTableDataSource(messages);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
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
  constructor() {
    this.getFavoriteAdvertisements$.subscribe();
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  deleteMessage(userAdvertisementId: any) {
    if (userAdvertisementId) {
      this.storageService.updateIsLoading(true);
      this.apiService
        .deleteUserFavoriteAdvertisement(
          this.encryptionService.encryptItem(this.userId()),
          userAdvertisementId
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success('User updated.', 'Update Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),
          catchError((err) => {
            this.toastService.error(
              'User Deletion failed. ' + err,
              'List failure',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
            return of(err);
          }),
          switchMap(() => this.getFavoriteAdvertisements$)
        )
        .subscribe();
    }
  }
}
