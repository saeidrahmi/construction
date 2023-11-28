import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-top-ad-info',
  templateUrl: './top-ad-info.component.html',
  styleUrls: ['./top-ad-info.component.css'],
  standalone: true,
  imports: [RouterModule],
})
export class TopAdInfoComponent {
  storageService = inject(StorageService);
  loggedIn = this.storageService?.isUserLoggedIn();
  constructor(private router: Router) {}

  navigateMyAds() {
    if (this.loggedIn()) this.router.navigate(['/general/user-advertisements']);
    else this.router.navigate(['/login']);
  }
  navigateNewAd() {
    if (this.loggedIn()) this.router.navigate(['/general/new-advertisement']);
    else this.router.navigate(['/login']);
  }
}
