import {
  Component,
  DestroyRef,
  Inject,
  Renderer2,
  inject,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { UserRoutingService } from '../../services/user-routing.service';
import { CarouselHeaderComponent } from '../carousel-header/carousel-header.component';
import { ImageService } from '../../services/image-service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'construction-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    CarouselHeaderComponent,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    public imageService: ImageService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.setAppTheme();
  }

  storageService = inject(StorageService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  userName = this.storageService.getUserfirstName();
  user = this.storageService.getUser();
  theme = this.storageService.getTheme();
  apiService = inject(ApiService);
  router = inject(Router);
  userRouting = inject(UserRoutingService);
  destroyRef = inject(DestroyRef);
  logout() {
    this.storageService.updateIsLoading(true);
    this.apiService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
  changeThemeMode() {
    const theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.storageService.updateTheme(theme);
    this.setAppTheme();
  }
  setAppTheme() {
    this.renderer.setAttribute(
      this.document.documentElement,
      'data-bs-theme',
      this.theme() as string
    );
  }
  navigateHomePage() {
    this.userRouting.navigateToUserMainPage();
  }
}
