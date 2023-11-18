import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { EncryptionService } from '../../services/encryption-service';
import { FormService } from '../../services/form.service';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, switchMap } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

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
  dataSource!: MatTableDataSource<any>;
  getAdvertisementMessges$ = this.apiService
    .getUserAdvertisementMessages(
      this.encryptionService.encryptItem(this.userId())
    )
    .pipe(
      takeUntilDestroyed(this.destroyRef),

      tap((messages: any) => {
        this.dataSource = new MatTableDataSource(messages);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }),

      switchMap(() =>
        this.apiService.getUserNumberOfNewMessages(
          this.encryptionService.encryptItem(this.userId())
        )
      )
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
  deleteMessage(row: any) {
    if (row.messageId) {
      this.storageService.updateIsLoading(true);
      this.apiService
        .deleteUserAdvertisementMessage(
          this.encryptionService.encryptItem(this.userId()),
          row.messageId,
          this.encryptionService.encryptItem(row.fromUserId),
          row.advertisementId
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success(
              'Message deleted successfully.',
              'Successful',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
          }),

          switchMap(() => this.getAdvertisementMessges$)
        )
        .subscribe();
    }
  }
  viewMessage(messageId: any) {
    this.router.navigate(['/general/message-details', messageId]);
  }
  deleteAllMessages() {
    this.apiService
      .deleteUserAllMessages(this.encryptionService.encryptItem(this.userId()))
      .pipe(
        takeUntilDestroyed(this.destroyRef),

        switchMap(() => this.getAdvertisementMessges$)
      )
      .subscribe();
  }

  navigateDetails(userAdvertisementId) {
    this.storageService.updateAdvertisementIdAndAction(
      userAdvertisementId,
      'view'
    );
    this.router.navigate(['/view-advertisement-details']);
  }
}
