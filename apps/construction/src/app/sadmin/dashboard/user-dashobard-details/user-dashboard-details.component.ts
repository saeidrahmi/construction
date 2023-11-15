import {
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BaseChartDirective } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';
import { take, tap, catchError, of } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { StorageService } from '../../../services/storage.service';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-user-dashboard-details',
  templateUrl: './user-dashboard-details.component.html',
  styleUrls: ['./user-dashboard-details.component.css'],
})
export class UserDashboardDetailsComponent {
  apiService = inject(ApiService);
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  barChartOptions: any = {
    responsive: true,
  };
  barChartLabelsDaily: string[] = [];
  barChartLabelsMonthly: string[] = [];
  barChartLabelsYearly: string[] = [];
  barChartType = 'bar';
  barChartLegend = true;
  barChartDataDaily: any[] = [{ data: [], label: 'Daily Registrations' }];
  barChartDataMonthly: any[] = [{ data: [], label: 'Monthly Registrations' }];
  barChartDataYearly: any[] = [{ data: [], label: 'Yearly Registrations' }];

  constructor() {
    this.apiService
      .getUserDashboardAdminDetails()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        tap((data: any) => {
          this.barChartLabelsDaily = data?.daily?.map(
            (entry) => entry.registeredDate
          );
          this.barChartDataDaily[0].data = data?.daily?.map(
            (entry) => entry.userCount
          );
          this.barChartLabelsMonthly = data?.monthly?.map(
            (entry) => entry.registeredMonth
          );
          this.barChartDataMonthly[0].data = data?.monthly?.map(
            (entry) => entry.userCount
          );
          this.barChartLabelsYearly = data?.yearly?.map(
            (entry) => entry.registeredYear
          );
          this.barChartDataYearly[0].data = data?.yearly?.map(
            (entry) => entry.userCount
          );
        }),
        catchError((err) => {
          this.toastService.error(
            'Getting Settings failed. ' + err,
            'List failure',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(err);
        })
      )
      .subscribe();
  }
}
