import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    @if (message) {
      <mat-card class="error-card">
        <mat-card-content>
          <div class="error-icon">
            <mat-icon color="warn">error_outline</mat-icon>
          </div>
          <div class="error-text">
            <p class="message">{{ message }}</p>
            @if (details) {
              <p class="details">{{ details }}</p>
            }
          </div>
          @if (showRetry) {
            <button mat-stroked-button color="warn" (click)="retry.emit()">
              <mat-icon>refresh</mat-icon>
              Retry
            </button>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [
    `
      .error-card {
        margin: 1rem 0;
        background-color: #ffebee;
        border-left: 4px solid #f44336;
        color: #b71c1c;
      }
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem !important;
      }
      .error-icon {
        display: flex;
        align-items: center;
      }
      .error-text {
        flex: 1;
      }
      .message {
        margin: 0;
        font-weight: 500;
        font-size: 1rem;
      }
      .details {
        margin: 0.25rem 0 0 0;
        font-size: 0.85rem;
        opacity: 0.8;
      }
    `,
  ],
})
export class ErrorMessageComponent {
  @Input() message?: string;
  @Input() details?: string;
  @Input() showRetry = false;
  @Output() retry = new EventEmitter<void>();
}
