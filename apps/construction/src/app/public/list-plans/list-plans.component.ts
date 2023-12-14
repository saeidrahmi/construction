import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { PlanComponent } from '../../common-components/plans/plan/plan.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-list-plans',
  templateUrl: './list-plans.component.html',
  styleUrls: ['./list-plans.component.css'],
  standalone: true,
  imports: [CommonModule, PlanComponent, RouterModule],
})
export class ListPlansComponent {
  apiService = inject(ApiService);
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  listPlans: any;

  constructor() {
    this.apiService
      .getAllActivePlans()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((plans) => {
          this.listPlans = plans;
        })
      )
      .subscribe();
  }
}
