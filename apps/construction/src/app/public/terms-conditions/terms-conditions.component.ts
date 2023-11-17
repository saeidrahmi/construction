import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class TermsConditionsComponent {
  constructor() {}
}
