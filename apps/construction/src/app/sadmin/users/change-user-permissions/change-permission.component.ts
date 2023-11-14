import { CommonUtilityService } from '../../../services/common-utility.service';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { StorageService } from '../../../services/storage.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { FormService } from '../../../services/form.service';
import { UserPermissionsInterface } from '../../../models/user-permissions';
import { catchError, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminSettingsInterface } from 'libs/common/src/models/admin-settings';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../services/encryption-service';

@Component({
  selector: 'app-change-permission-user',
  templateUrl: './change-permission.component.html',
  styleUrls: ['./change-permission.component.css'],
})
export class ChangeUserPermissionComponent {
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  storageService = inject(StorageService);
  commonUtilityService = inject(CommonUtilityService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  form: FormGroup;
  selectedRole: string;
  env: EnvironmentInfo = new EnvironmentInfo();

  roles = this.env.getRoles();
  formService = inject(FormService);
  userPermissions: UserPermissionsInterface = {};
  userPermission = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();

  getUserIdEdited = this.storageService.getUserIdEdited();
  constructor(private fb: FormBuilder) {
    if (
      this.userRole() != 'SAdmin' &&
      (!this.userPermission().createUser || !this.getUserIdEdited())
    )
      this.router.navigate(['/admin/user-profile']);
    this.apiService
      .getUserPermissions(
        this.encryptionService.encryptItem(this.getUserIdEdited())
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((permissions: UserPermissionsInterface) => {
          this.userPermissions = permissions;
          this.toastService.success('Updated.', 'Update Successful', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),
        catchError((err) => {
          this.toastService.error('Update failed. ' + err, 'Update failure', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(err);
        })
      )
      .subscribe();
    this.form = this.fb.group({
      viewDashboard: new FormControl(this.userPermissions?.viewDashboard, []),
      updateAdminSettings: new FormControl(
        this.userPermissions?.updateAdminSettings,
        []
      ),
      createUser: new FormControl(this.userPermissions?.createUser, []),
      viewUsers: new FormControl(this.userPermissions?.viewUsers, []),
      createPlan: new FormControl(this.userPermissions?.createPlan, []),
      listPlans: new FormControl(this.userPermissions?.listPlans, []),
      viewPendingAdvertisements: new FormControl(
        this.userPermissions?.viewPendingAdvertisements,
        []
      ),
      approveAdvertisement: new FormControl(
        this.userPermissions?.approveAdvertisement,
        []
      ),
      allowUserActions: new FormControl(
        this.userPermissions?.allowUserActions,
        []
      ),
      allowPlanActions: new FormControl(
        this.userPermissions?.allowPlanActions,
        []
      ),
    });
  }
  submit() {
    let user = {
      firstName: this.form.get('firstName').value,
      userId: this.encryptionService.encryptItem(
        this.form.get('userId').value as string
      ),
      lastName: this.form.get('lastName').value,
      role: this.selectedRole,
      password: this.encryptionService.encryptItem(
        this.commonUtilityService.generateRandomPassword(12) as string
      ),
    };
    if (this.selectedRole === 'Admin')
      Object.assign(user, {
        userPermissions: {
          viewDashboard: this.userPermissions.viewDashboard ? 1 : 0,
          updateAdminSettings: this.userPermissions.updateAdminSettings ? 1 : 0,
          createUser: this.userPermissions.createUser ? 1 : 0,
          viewUsers: this.userPermissions.viewUsers ? 1 : 0,
          createPlan: this.userPermissions.createPlan ? 1 : 0,
          listPlans: this.userPermissions.listPlans ? 1 : 0,
          allowUserActions: this.userPermissions.allowUserActions ? 1 : 0,
          allowPlanActions: this.userPermissions.allowPlanActions ? 1 : 0,
          approveAdvertisement: this.userPermissions.approveAdvertisement
            ? 1
            : 0,
          viewPendingAdvertisements: this.userPermissions
            .viewPendingAdvertisements
            ? 1
            : 0,
        },
      });

    this.apiService
      .createNewUser(user)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.toastService.success('Updated.', 'Update Successful', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),
        catchError((err) => {
          this.toastService.error('Update failed. ' + err, 'Update failure', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(err);
        })
      )
      .subscribe();
  }
}
