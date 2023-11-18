import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of, finalize, take } from 'rxjs';
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
    })
  );
  listPlans: any;
  selectedPlan: PlanInterface;
  tax: any;
  constructor() {
    this.getPlans$.subscribe();
    this.apiService
      .getTax()
      .pipe(
        takeUntilDestroyed(),

        tap((info: any) => {
          this.tax = info.tax;
        })
      )
      .subscribe();
  }

  purchase() {
    if (this.selectedPlan) {
      const userId = this.storageService?.getUserId();
      const payment = {
        amount: this.selectedPlan?.priceAfterDiscount,
        totalAmount:
          (parseFloat(this.selectedPlan?.priceAfterDiscount.toString()) *
            parseFloat(this.tax)) /
            100 +
          parseFloat(this.selectedPlan?.priceAfterDiscount.toString()),
        tax:
          (parseFloat(this.selectedPlan?.priceAfterDiscount.toString()) *
            parseFloat(this.tax)) /
          100,
        paymentConfirmation: 'PAL-235894-CONFIRM',
      };
      this.apiService
        .purchasePlan(
          this.encryptionService.encryptItem(userId()),
          this.selectedPlan,
          payment
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((response) => {
            this.storageService.updatePlan(response?.plan);
            this.toastService.success('Plan purchased. ', 'Success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
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
