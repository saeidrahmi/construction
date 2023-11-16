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
import { take, tap, catchError, of, switchMap } from 'rxjs';
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
  barChartDetailsDailyLabels: string[] = [];
  barChartDetailsMonthlyLabels: string[] = [];
  barChartYearlyDetailsLabels: string[] = [];

  barChartType = 'bar';
  barChartLegend = true;
  barChartDataDaily: any[] = [{ data: [], label: 'Daily Registrations' }];
  barChartDataMonthly: any[] = [{ data: [], label: 'Monthly Registrations' }];
  barChartDataYearly: any[] = [{ data: [], label: 'Yearly Registrations' }];

  barChartDetailsDailyData: any[] = [
    { data: [], label: 'Daily Registrations' },
  ];

  barChartDetailsMonthlyData: any[] = [
    { data: [], label: 'Monthly Registrations' },
  ];
  barChartDetailsYearlyData: any[] = [
    { data: [], label: 'Monthly Registrations' },
  ];
  pieChartLabels: any[] = ['Free Active Users', 'Paid Active Users'];

  pieChartData: any[] = [
    {
      data: [],
      label: 'Active Users',
      backgroundColor: ['#FF6384', '#36A2EB'],
    },
  ];
  pieChartLegend: boolean = true;
  pieChartType: string = 'pie';
  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                return {
                  text: `${label}: ${value}`,
                  fillStyle: dataset.backgroundColor
                    ? dataset.backgroundColor[i]
                    : '',
                };
              });
            }
            return [];
          },
        },
      },
    },
  };
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
        }),
        switchMap(() => {
          return this.apiService
            .getUserDashboardAdminDetailsBasedOnRegistrationAndPlanType()
            .pipe(
              take(1),
              tap((data) => {
                // daily
                this.barChartDetailsDailyLabels = data?.daily?.map(
                  (entry) => entry.registeredDate
                );
                this.barChartDetailsDailyData = [
                  {
                    data: data?.daily?.map((entry) => entry.totalActiveUsers),
                    label: 'Total Active Users',
                  },
                  {
                    data: data?.daily?.map((entry) => entry.freeActiveUsers),
                    label: 'Free Active Users',
                  },
                  {
                    data: data?.daily?.map((entry) => entry.paidActiveUsers),
                    label: 'Paid Active Users',
                  },
                ];
                // monthly
                this.barChartDetailsMonthlyLabels = data?.monthly?.map(
                  (entry) => entry.registeredDate
                );
                this.barChartDetailsMonthlyData = [
                  {
                    data: data?.monthly?.map((entry) => entry.totalActiveUsers),
                    label: 'Total Active Users',
                  },
                  {
                    data: data?.monthly?.map((entry) => entry.freeActiveUsers),
                    label: 'Free Active Users',
                  },
                  {
                    data: data?.monthly?.map((entry) => entry.paidActiveUsers),
                    label: 'Paid Active Users',
                  },
                ];
                // yearly
                this.barChartYearlyDetailsLabels = data?.yearly?.map(
                  (entry) => entry.registeredDate
                );
                this.barChartDetailsYearlyData = [
                  {
                    data: data?.yearly?.map((entry) => entry.totalActiveUsers),
                    label: 'Total Active Users',
                  },
                  {
                    data: data?.yearly?.map((entry) => entry.freeActiveUsers),
                    label: 'Free Active Users',
                  },
                  {
                    data: data?.yearly?.map((entry) => entry.paidActiveUsers),
                    label: 'Paid Active Users',
                  },
                ];
              })
            );
        }),
        switchMap(() => {
          return this.apiService
            .getUserDashboardTotalCountBasedOnPlanType()
            .pipe(
              take(1),
              tap((data) => {
                this.pieChartData[0].data = [
                  data.freeActiveUsers,
                  data.paidActiveUsers,
                ];
              })
            );
        })
      )
      .subscribe();
  }
}
