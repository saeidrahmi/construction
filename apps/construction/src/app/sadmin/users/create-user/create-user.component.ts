import { CommonUtilityService } from '../../../services/common-utility.service';
import { Component, DestroyRef, inject } from '@angular/core';
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
import { tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../services/encryption-service';
@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent {
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
  formErrors: string[] = [];
  roles = this.env.getRoles();
  formService = inject(FormService);
  userPermissions: UserPermissionsInterface = {};
  userPermission = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  constructor(private fb: FormBuilder) {
    if (this.userRole() != 'SAdmin' && !this.userPermission().createUser)
      this.router.navigate(['/admin/user-profile']);
    this.form = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      userId: new FormControl('', [Validators.required, Validators.email]),
      lastName: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
      viewDashboard: new FormControl('', []),
      updateAdminSettings: new FormControl('', []),
      createUser: new FormControl('', []),
      viewUsers: new FormControl('', []),
      createPlan: new FormControl('', []),
      listPlans: new FormControl('', []),
      viewPendingAdvertisements: new FormControl('', []),
      approveAdvertisement: new FormControl('', []),
      allowUserActions: new FormControl('', []),
      allowPlanActions: new FormControl('', []),
      viewRfps: new FormControl('', []),
      approvedRfps: new FormControl('', []),
      viewSupportRequests: new FormControl('', []),
    });
  }
  submit() {
    this.formErrors = [];

    if (this.form.invalid) {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    } else {
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
            updateAdminSettings: this.userPermissions.updateAdminSettings
              ? 1
              : 0,
            createUser: this.userPermissions.createUser ? 1 : 0,
            viewUsers: this.userPermissions.viewUsers ? 1 : 0,
            createPlan: this.userPermissions.createPlan ? 1 : 0,
            listPlans: this.userPermissions.listPlans ? 1 : 0,
            allowUserActions: this.userPermissions.allowUserActions ? 1 : 0,
            allowPlanActions: this.userPermissions.allowPlanActions ? 1 : 0,
            viewRfps: this.userPermissions.viewRfps ? 1 : 0,
            approvedRfps: this.userPermissions.approvedRfps ? 1 : 0,
            viewSupportRequests: this.userPermissions.viewSupportRequests
              ? 1
              : 0,

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
            this.toastService.success(
              'New user created successfully.',
              'Success',
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
  }
}
