import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-carousel-header',
  templateUrl: './carousel-header.component.html',
  styleUrls: ['./carousel-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, RouterModule],
})
export class CarouselHeaderComponent {}
