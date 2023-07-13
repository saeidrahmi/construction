import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'construction-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  storageService = inject(StorageService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  getYear(): Date {
    return new Date();
  }
}
