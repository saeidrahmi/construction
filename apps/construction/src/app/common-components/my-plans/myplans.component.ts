import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlanInterface } from '../../models/plan';

@Component({
  selector: 'app-myplans',
  templateUrl: './myplans.component.html',
  styleUrls: ['./myplans.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class MyPlansComponent {
  @Input('plan') plan: any = {};
  @Input('currentPlan') currentPlan: boolean = false;

  constructor() {}
  getDaysRemaining(expiryDate: any): number {
    const currentDate = new Date();
    const expiryDateTime = new Date(expiryDate).getTime();
    const currentTime = currentDate.getTime();
    const timeDifference = expiryDateTime - currentTime;
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysRemaining;
  }
}
