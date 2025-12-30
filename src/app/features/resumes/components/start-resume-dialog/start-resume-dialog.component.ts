import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { UserService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';
import { EventSourcePolyfill } from 'event-source-polyfill';

@Component({
  selector: 'app-start-resume-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Start New Resume Generation</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Job URL</mat-label>
          <input
            matInput
            formControlName="jobUrl"
            placeholder="https://linkedin.com/jobs/..."
            required
          />
          @if (form.get('jobUrl')?.hasError('required')) {
            <mat-error> Job URL is required </mat-error>
          }
          @if (form.get('jobUrl')?.hasError('pattern')) {
            <mat-error> Please enter a valid URL (starting with http:// or https://) </mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onStart()"
        [disabled]="form.invalid || isStarting()"
      >
        @if (isStarting()) {
          Starting...
        } @else {
          Start
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class StartResumeDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<StartResumeDialogComponent>);
  private readonly api = inject(ApiService);
  private readonly userState = inject(UserService);
  private readonly router = inject(Router);

  form: FormGroup;
  isStarting = signal(false);

  constructor() {
    this.form = this.fb.group({
      jobUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  onStart(): void {
    if (this.form.valid) {
      const userId = this.userState.getStoredUserId();
      if (!userId) {
        alert('Please register first');
        return;
      }

      this.isStarting.set(true);
      const jobUrl = this.form.value.jobUrl;

      // Start SSE connection
      // Note: We need to properly utilize environment for base URL
      // Assuming api.apiUrl is exposed or we construct it.
      // Since ApiService is private about apiUrl, we might need a getter or use a relative path if proxied.
      // Based on ApiService snippet, it uses private `baseUrl`.
      // We'll try to construct it or assume relative if proxied, but likely need absolute for EventSource.
      // Let's assume the API Service has a public getter for the base URL or we reconstruct it.
      // For now, hardcoding based on standard practice or checking ApiService again.
      // Looking at environment.ts previously: http://localhost:8080/api/v1

      const baseUrl = 'http://localhost:8080/api/v1'; // TODO: Get from environment properly

      const eventSource = new EventSourcePolyfill(`${baseUrl}/run/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, job_url: jobUrl }),
      });

      eventSource.addEventListener('run_started', (event: Event) => {
        const messageEvent = event as MessageEvent;
        const data = JSON.parse(messageEvent.data);
        const runId = data.run_id;
        this.dialogRef.close(true);
        this.router.navigate(['/resumes', runId]);
        eventSource.close();
      });

      eventSource.addEventListener('error', (err: unknown) => {
        console.error('SSE Error:', err);
        this.isStarting.set(false);
        eventSource.close();
        // Ideally show an error message
        alert('Failed to start resume generation (SSE connection error)');
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
