import { Component, inject, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'construction-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  storageService = inject(StorageService);
  email: string = '';
  router = inject(Router);
  isLoggedIn = this.storageService.isUserLoggedIn();
  getYear(): Date {
    return new Date();
  }

  navigateSignup() {
    this.router.navigate(['/signup'], { queryParams: { email: this.email } });
  }
}
