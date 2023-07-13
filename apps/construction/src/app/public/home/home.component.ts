import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { UserRoutingService } from '../../services/user-routing.service';

@Component({
  selector: 'construction-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  storageService = inject(StorageService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  userRouting = inject(UserRoutingService);
  constructor() {
    if (this.isLoggedIn()) this.userRouting.navigateToUserMainPage();
  }
}
