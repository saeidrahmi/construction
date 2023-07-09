import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'api-server-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './api-server-error.component.html',
  styleUrls: ['./api-server-error.component.scss'],
})
export class ApiServerErrorComponent {
  @Input() error: string | undefined = '';
}
