import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of, finalize } from 'rxjs';
import { PlanInterface } from '../../models/plan';
import { StorageService } from '../../services/storage.service';
import { EncryptionService } from '../../services/encryption-service';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-purchase-plan',
  templateUrl: './purchase-plan.component.html',
  styleUrls: ['./purchase-plan.component.css'],
})
export class PurchasePlanComponent {
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  getPlans$ = this.apiService.getAllActiveNonFreePlans().pipe(
    takeUntilDestroyed(),
    tap((plans: any) => {
      this.listPlans = plans;
    }),
    catchError((err) => {
      this.toastService.error('Plan list failed. ' + err, 'Plan failure', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
      return of(err);
    })
  );
  listPlans: any;
  selectedPlan: PlanInterface;
  constructor() {
    this.getPlans$.subscribe();
  }

  purchase() {
    if (this.selectedPlan) {
      const payment = 'PAL-235894-CONFIRM';
      const userId = this.storageService?.getUserId();
      this.apiService
        .purchasePlan(
          this.encryptionService.encryptItem(userId()),
          this.selectedPlan,
          payment
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((response) => {
            this.toastService.success('Plan purchased. ', 'Success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),
          catchError((err) => {
            return of(err);
          })
        )
        .subscribe();
    }
  }
  goForward(stepper: MatStepper, plan: PlanInterface) {
    if (plan) {
      stepper.next();
      this.selectedPlan = plan;
    }
  }
}
