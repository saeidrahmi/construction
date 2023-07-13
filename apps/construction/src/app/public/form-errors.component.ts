import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-errors',
  template: `
    <div *ngIf="formErrors.length > 0" class="border border-danger my-3 p-3 ">
      <p class="fw-b">Please fix the following errors:</p>
      <ul class="text-danger">
        <li *ngFor="let error of formErrors">
          <span>{{ error }}</span>
        </li>
      </ul>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
})
export class FormErrorsComponent {
  @Input() formErrors: string[] = [];
}
