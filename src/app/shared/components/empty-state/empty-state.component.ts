import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  template: `
    <mat-card class="empty-state-card">
      <mat-card-content>
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        @if (actionLabel) {
          <button mat-raised-button color="primary" (click)="action.emit()">
            {{ actionLabel }}
          </button>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .empty-state-card {
        margin: 1rem;
        text-align: center;
        padding: 2rem;
      }
      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #555;
      }
      p {
        margin: 0;
        color: #777;
        max-width: 400px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title = 'No items';
  @Input() message = 'Get started by adding your first item.';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
