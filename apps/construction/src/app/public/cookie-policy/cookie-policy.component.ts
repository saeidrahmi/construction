import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class CookiePolicyComponent {
  constructor() {}
}
