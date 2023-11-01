import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { UserApiResponseInterface } from 'libs/common/src/models/user-response';

@Component({
  selector: 'app-user-messages',
  templateUrl: './user-messages.component.html',
  styleUrls: ['./user-messages.component.css'],
})
export class UserMessagesComponent {
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  apiService = inject(ApiService);
  router = inject(Router);
  formService = inject(FormService);
  destroyRef = inject(DestroyRef);
  encryptionService = inject(EncryptionService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  user = this.storageService.getUser();
  userId = this.storageService?.getUserId();
  displayedColumns: string[] = [
    'dateCreated',
    'messageId',
    'advertisementId',
    'message',
    'viewed',
    'action',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource!: MatTableDataSource<UserApiResponseInterface>;
  getAdvertisementMessges$ = this.apiService
    .getUserAdvertisementMessages(
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
    this.getAdvertisementMessges$.subscribe();
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  deleteMessage(messageId: any) {
    if (messageId) {
      this.storageService.updateIsLoading(true);
      this.apiService
        .deleteUserAdvertisementMessage(
          this.encryptionService.encryptItem(this.userId()),
          messageId
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
          switchMap(() => this.getAdvertisementMessges$)
        )
        .subscribe();
    }
  }
  viewMessage(messageId: any) {
    this.router.navigate(['/general/message-details', messageId]);
  }

  // changeAccountStatus(userId: string, activate: boolean) {
  //   this.storageService.updateIsLoading(true);
  //   this.apiService
  //     .updateUserActivationStatus(userId, activate, true)
  //     .pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       tap((users: UserApiResponseInterface[]) => {
  //         this.dataSource = new MatTableDataSource(users);
  //         this.dataSource.paginator = this.paginator;
  //         this.dataSource.sort = this.sort;
  //         this.toastService.success('User updated.', 'Update Successful', {
  //           timeOut: 3000,
  //           positionClass: 'toast-top-right',
  //           closeButton: true,
  //           progressBar: true,
  //         });
  //       }),
  //       catchError((err) => {
  //         this.toastService.error(
  //           'User update failed. ' + err,
  //           'List failure',
  //           {
  //             timeOut: 3000,
  //             positionClass: 'toast-top-right',
  //             closeButton: true,
  //             progressBar: true,
  //           }
  //         );
  //         return of(err);
  //       })
  //     )
  //     .subscribe();
  // }
}
