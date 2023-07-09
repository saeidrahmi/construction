import { CommonModule } from '@angular/common';

// spinner.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading" class="spinner-overlay">
      <div class="spinner-container">
        <div class="spinner"></div>
        <div class="spinner-text">Loading...</div>
      </div>
    </div>
  `,
  styles: [
    `
      .spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
      }

      .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .spinner {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        animation: spinner-spin 1s linear infinite;
      }

      .spinner-text {
        margin-top: 10px;
        font-size: 16px;
        font-weight: bold;
      }

      @keyframes spinner-spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {
  @Input() isLoading: boolean | undefined = false;
}
