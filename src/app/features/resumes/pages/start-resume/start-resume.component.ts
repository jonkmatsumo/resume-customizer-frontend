import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../../core/services/user.service';
import { environment } from '../../../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';

@Component({
  selector: 'app-start-resume',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="start-resume-container">
      <mat-card class="start-card">
        <mat-card-header>
          <div mat-card-avatar>
            <mat-icon color="primary">description</mat-icon>
          </div>
          <mat-card-title>Start New Resume Generation</mat-card-title>
          <mat-card-subtitle>
            Enter the URL of the job posting you want to target
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (isStarting()) {
            <div class="starting-state">
              <mat-spinner diameter="48"></mat-spinner>
              <h3>Starting Generation...</h3>
              <p>Please wait while we initialize the pipeline.</p>
            </div>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onStart()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Job Posting URL</mat-label>
                <input
                  matInput
                  formControlName="jobUrl"
                  placeholder="https://linkedin.com/jobs/..."
                  required
                />
                <mat-icon matSuffix>link</mat-icon>
                @if (form.get('jobUrl')?.hasError('required')) {
                  <mat-error>Job URL is required</mat-error>
                }
                @if (form.get('jobUrl')?.hasError('pattern')) {
                  <mat-error
                    >Please enter a valid URL (starting with http:// or https://)</mat-error
                  >
                }
              </mat-form-field>

              @if (error()) {
                <div class="error-message">
                  <mat-icon color="warn">error</mat-icon>
                  <span>{{ error() }}</span>
                </div>
              }
            </form>
          }
        </mat-card-content>

        <mat-card-actions align="end">
          @if (!isStarting()) {
            <button mat-button (click)="onCancel()" type="button">Cancel</button>
            <button
              mat-raised-button
              color="primary"
              (click)="onStart()"
              [disabled]="form.invalid || isStarting()"
            >
              Start Generation
            </button>
          }
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .start-resume-container {
        display: flex;
        justify-content: center;
        padding: 3rem 1rem;
        min-height: calc(100vh - 64px);
        background-color: #f5f5f5;
      }
      .start-card {
        max-width: 600px;
        width: 100%;
        height: fit-content;
      }
      .full-width {
        width: 100%;
        margin-top: 1rem;
      }
      .starting-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 0;
        gap: 1rem;
        text-align: center;
      }
      .starting-state h3 {
        margin: 0;
        color: #333;
      }
      .starting-state p {
        margin: 0;
        color: #666;
      }
      .error-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #f44336;
        background-color: #ffebee;
        padding: 0.75rem;
        border-radius: 4px;
        margin-top: 1rem;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class StartResumeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userState = inject(UserService);

  form: FormGroup;
  isStarting = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.form = this.fb.group({
      jobUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    });
  }

  onStart(): void {
    if (this.form.invalid) return;

    this.error.set(null);
    const userId = this.userState.getStoredUserId();
    if (!userId) {
      this.error.set('Authentication error. Please log in again.');
      return;
    }

    this.isStarting.set(true);
    const jobUrl = this.form.value.jobUrl;

    const baseUrl = `${environment.apiUrl}/${environment.apiVersion}`;

    // Using EventSourcePolyfill to support custom headers (for potential auth or other needs)
    const eventSource = new EventSourcePolyfill(`${baseUrl}/run/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, job_url: jobUrl }),
    });

    eventSource.addEventListener('run_started', (event: Event) => {
      const messageEvent = event as MessageEvent;
      try {
        const data = JSON.parse(messageEvent.data);
        const runId = data.run_id;
        eventSource.close();
        this.router.navigate(['/resumes', runId]);
      } catch (e) {
        console.error('Error parsing SSE data:', e);
        this.error.set('Error starting generation. Please try again.');
        this.isStarting.set(false);
        eventSource.close();
      }
    });

    eventSource.addEventListener('error', (err: unknown) => {
      console.error('SSE Error:', err);
      // Check if it's just a network error or actual failure
      // EventSource error usually doesn't give much info
      this.error.set('Failed to connect to generation service. Please try again.');
      this.isStarting.set(false);
      eventSource.close();
    });
  }

  onCancel(): void {
    this.router.navigate(['/resumes']);
  }
}
