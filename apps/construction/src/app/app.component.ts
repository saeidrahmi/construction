import { CommonModule } from '@angular/common';
import {
  Component,
  TemplateRef,
  ViewChild,
  inject,
  DestroyRef,
} from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { SpinnerComponent } from './spinner/spinner.component';
import { StorageService } from './services/storage.service';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { switchMap, takeUntil } from 'rxjs';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ApiService } from './services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    RouterOutlet,
    SpinnerComponent,
  ],
  selector: 'construction-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('sessionIdleTemplate') sessionIdleTemplate!: TemplateRef<any>;
  sessionIdleTemplateModal: any = null;
  modalService = inject(NgbModal);
  destroyRef = inject(DestroyRef);
  title = 'Construction';
  storageService = inject(StorageService);
  loading = this.storageService.isLoading();
  loggedIn = this.storageService.isUserLoggedIn();
  login$ = toObservable(this.loggedIn);
  theme = this.storageService.getTheme();
  apiService = inject(ApiService);
  idleState = 'NOT_STARTED';
  countdown!: number;
  lastPing!: Date | null;
  environment: EnvironmentInfo = new EnvironmentInfo();
  constructor(private idle: Idle, keepalive: Keepalive) {
    idle.setIdle(this.environment.sessionIdle); // how long can they be inactive before considered idle, in seconds
    idle.setTimeout(this.environment.sessionTimeout); // how long can they be idle before considered timed out, in seconds
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // provide sources that will "interrupt" aka provide events indicating the user is active

    // do something when the user becomes idle
    idle.onIdleStart.subscribe(() => {
      this.sessionIdleTemplateModal = this.modalService.open(
        this.sessionIdleTemplate,
        { size: 'lg' }
      );
      this.idleState = 'IDLE';
    });
    // do something when the user is no longer idle
    idle.onIdleEnd.pipe(takeUntilDestroyed()).subscribe(() => {
      this.idleState = 'ONLINE';
      this.countdown = 0;
    });
    // do something when the user has timed out
    idle.onTimeout
      .pipe(
        takeUntilDestroyed(),
        switchMap(() => {
          this.idleState = 'TIMED_OUT';
          this.sessionIdleTemplateModal.close();
          return this.apiService.logout();
        })
      )
      .subscribe();
    // do something as the timeout countdown does its thing
    idle.onTimeoutWarning.pipe(takeUntilDestroyed()).subscribe((seconds) => {
      this.countdown = seconds;
    });

    // set keepalive parameters, omit if not using keepalive
    keepalive.interval(this.environment.sessionPing); // will ping at this interval while not idle, in seconds
    keepalive.onPing
      .pipe(takeUntilDestroyed())
      .subscribe(() => (this.lastPing = new Date())); // do something when it pings
    this.login$.pipe(takeUntilDestroyed()).subscribe((login) => {
      if (login) {
        this.reset();
      }
    });
  }
  reset() {
    // we'll call this method when we want to start/reset the idle process
    this.idle.watch();
    this.idleState = 'ONLINE';
    this.countdown = 0;
    this.lastPing = null;
  }
  stay() {
    this.sessionIdleTemplateModal.close();
    this.reset();
  }
  logout() {
    this.sessionIdleTemplateModal.close();
    this.apiService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
