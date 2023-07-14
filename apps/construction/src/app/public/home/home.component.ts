import { Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { UserRoutingService } from '../../services/user-routing.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'construction-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  isLoggedIn = this.storageService.isUserLoggedIn();
  userRouting = inject(UserRoutingService);
  constructor(private router: Router, private route: ActivatedRoute) {
    if (this.isLoggedIn()) this.userRouting.navigateToUserMainPage();
  }
  ngOnInit(): void {
    this.router.events
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((event) => event instanceof NavigationEnd),
        map(() => this.route),
        map((route) => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data)
      )
      .subscribe((event) => {
        const fragment = this.route.snapshot.fragment;
        if (fragment) {
          const element = document.querySelector('#' + fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
  }
}
