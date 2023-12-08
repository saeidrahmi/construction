import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { switchMap, tap } from 'rxjs';
import { EncryptionService } from '../../services/encryption-service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
})
export class SupportComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  plan = this.storageService.getPlan();
  encryptionService = inject(EncryptionService);
  toastService = inject(ToastrService);
  messageList: any[] = [];
  userPermissions = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  getList$ = this.apiService.getAdminSupportRequestMessages().pipe(
    takeUntilDestroyed(),
    tap((list) => {
      this.messageList = list;
    })
  );
  constructor() {
    if (
      this.userRole() != 'SAdmin' &&
      !this.userPermissions().viewSupportRequests
    )
      this.router.navigate(['/admin/user-profile']);

    this.getList$.subscribe();
  }
  delete(messageId, userId) {
    this.apiService
      .deleteRequestSupportMessagesController(
        this.encryptionService.encryptItem(userId),
        messageId
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.toastService.success('Delete Successful.', 'Successful', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),
        switchMap(() => this.getList$)
      )
      .subscribe();
  }
}
