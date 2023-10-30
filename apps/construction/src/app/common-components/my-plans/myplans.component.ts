import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { PlanInterface } from '../../models/plan';
import { UserService } from '../../services/user-service';

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
  userService = inject(UserService);
  currentDate = new Date();

  constructor() {}
}
