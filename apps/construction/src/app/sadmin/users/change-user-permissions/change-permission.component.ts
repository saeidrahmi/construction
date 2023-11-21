import { CommonUtilityService } from '../../../services/common-utility.service';
import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { StorageService } from '../../../services/storage.service';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { FormService } from '../../../services/form.service';
import { UserPermissionsInterface } from '../../../models/user-permissions';
import { tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((permissions: UserPermissionsInterface) => {
        if (permissions) this.userPermissions = permissions;
        else
          this.userPermissions = {
            viewDashboard: false,
            updateAdminSettings: false,
            createUser: false,
            viewUsers: false,
            createPlan: false,
            listPlans: false,
            viewPendingAdvertisements: false,
            approveAdvertisement: false,
            allowPlanActions: false,
            allowUserActions: false,
            viewRfps: false,
            approvedRfps: false,
          };
      });
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
      viewRfps: new FormControl(this.userPermissions?.viewRfps, []),
      approvedRfps: new FormControl(this.userPermissions?.approvedRfps, []),
    });
  }
  submit() {
    const data = {
      userId: this.encryptionService.encryptItem(this.getUserIdEdited()),
      userPermissions: {
        viewDashboard: this.userPermissions.viewDashboard ? 1 : 0,
        updateAdminSettings: this.userPermissions.updateAdminSettings ? 1 : 0,
        createUser: this.userPermissions.createUser ? 1 : 0,
        viewUsers: this.userPermissions.viewUsers ? 1 : 0,
        createPlan: this.userPermissions.createPlan ? 1 : 0,
        listPlans: this.userPermissions.listPlans ? 1 : 0,
        allowUserActions: this.userPermissions.allowUserActions ? 1 : 0,
        allowPlanActions: this.userPermissions.allowPlanActions ? 1 : 0,
        viewRfps: this.userPermissions.viewRfps ? 1 : 0,
        approvedRfps: this.userPermissions.approvedRfps ? 1 : 0,
        approveAdvertisement: this.userPermissions.approveAdvertisement ? 1 : 0,
        viewPendingAdvertisements: this.userPermissions
          .viewPendingAdvertisements
          ? 1
          : 0,
      },
    };

    this.apiService
      .updateUserPermissions(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((userPermissions: any) => {
        this.userPermission = userPermissions;
        // this.router.navigate(['/admin/users']);
        this.toastService.success('Updated Successfully.', 'Success', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          closeButton: true,
          progressBar: true,
        });
      });
  }
}
