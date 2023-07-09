import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { SpinnerComponent } from './spinner/spinner.component';
import { StorageService } from './services/storage.service';

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
  //arr = toSignal(of(1, 2, 13).pipe(takeUntilDestroyed(this.sub)));
  constructor() {}
  // add() {
  //   this.data.update((data) => [...data, this.item()]);
  // }
  // remove(item: string) {
  //   this.data.set(this.data().filter((dat) => dat != item));
  // }
  theme: string = 'dark';
  title = 'construction';
  storageService = inject(StorageService);
  loading = this.storageService.isLoading();
}
