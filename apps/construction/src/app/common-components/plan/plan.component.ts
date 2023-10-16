import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlanInterface } from '../../models/plan';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PlanComponent {
  @Input('plan') plan: PlanInterface = {};
  constructor() {}
  selectPlan(plan: PlanInterface) {}
}
