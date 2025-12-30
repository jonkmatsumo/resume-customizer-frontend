import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    @if (message) {
      <mat-card class="error-card">
        <mat-card-content>
          <p>{{ message }}</p>
          @if (showRetry) {
            <button mat-raised-button color="primary" (click)="retry.emit()">Retry</button>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [
    `
      .error-card {
        margin: 1rem;
        background-color: #ffebee;
        color: #c62828;
      }
      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      p {
        margin: 0;
        text-align: center;
      }
    `,
  ],
})
export class ErrorMessageComponent {
  @Input() message?: string;
  @Input() showRetry = false;
  @Output() retry = new EventEmitter<void>();
}
