import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { JobsService } from '../../../../core/services/jobs.service';
import { UserService } from '../../../../core/services/user.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-experience-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="experience-container">
      <header class="page-header">
        <div>
          <h1>Employment History</h1>
          <p class="subtitle">Manage your professional experience</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/experience/edit">
          <mat-icon>add</mat-icon>
          Add Job
        </button>
      </header>

      @if (jobsService.isLoading()) {
        <app-loading-spinner message="Loading jobs..."></app-loading-spinner>
      }

      @if (errorMessage()) {
        <app-error-message
          [message]="errorMessage()!"
          [showRetry]="true"
          (onRetry)="loadJobs()"
        ></app-error-message>
      }

      @if (!jobsService.isLoading() && !errorMessage()) {
        <div class="content-area">
          @if (jobsService.jobs().length === 0) {
            <app-empty-state
              icon="work_off"
              title="No jobs found"
              message="Add your employment history to start generating tailored resumes."
              actionLabel="Add First Job"
              (action)="navigateToAddJob()"
            ></app-empty-state>
          } @else {
            <div class="filters">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search jobs</mat-label>
                <mat-icon matPrefix>search</mat-icon>
                <input
                  matInput
                  [ngModel]="searchTerm()"
                  (ngModelChange)="searchTerm.set($event)"
                  placeholder="Ex. Software Engineer"
                />
              </mat-form-field>
            </div>

            <div class="jobs-grid">
              @for (job of filteredJobs(); track job.id) {
                <mat-card class="job-card">
                  <mat-card-header>
                    <mat-card-title>{{ job.role_title }}</mat-card-title>
                    <mat-card-subtitle>{{ job.company }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="location-date">
                      <mat-icon inline>location_on</mat-icon> {{ job.location }}
                      <!-- Add date range if available in model -->
                    </p>
                  </mat-card-content>
                  <mat-card-actions align="end">
                    <button mat-button color="primary" [routerLink]="['/experience/edit', job.id]">
                      Edit
                    </button>
                    <button mat-button color="warn" (click)="deleteJob(job.id)">Delete</button>
                  </mat-card-actions>
                </mat-card>
              }
              @if (filteredJobs().length === 0 && jobsService.jobs().length > 0) {
                <div class="no-results">
                  <p>No jobs match your search.</p>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .experience-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
      }
      .subtitle {
        color: #666;
        margin-top: 0.5rem;
      }
      .filters {
        margin-bottom: 1.5rem;
      }
      .search-field {
        width: 100%;
        max-width: 400px;
      }
      .jobs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .job-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .job-card mat-card-content {
        flex-grow: 1;
        padding-top: 1rem;
      }
      .location-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #555;
        font-size: 0.9rem;
      }
      .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 2rem;
        color: #666;
      }
    `,
  ],
})
export class ExperienceOverviewComponent implements OnInit {
  private readonly router = inject(Router);
  readonly jobsService = inject(JobsService);
  private readonly userState = inject(UserService);

  searchTerm = signal('');
  errorMessage = signal<string | undefined>(undefined);

  // Computed signal for filtering jobs
  filteredJobs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const jobs = this.jobsService.jobs();

    if (!term) return jobs;

    return jobs.filter(
      (job) =>
        job.company.toLowerCase().includes(term) ||
        job.role_title.toLowerCase().includes(term) ||
        (job.location || '').toLowerCase().includes(term),
    );
  });

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    const userId = this.userState.getStoredUserId();
    if (!userId) {
      this.errorMessage.set('User not found. Please log in.');
      return;
    }

    this.errorMessage.set(undefined);
    this.jobsService.loadJobs(userId).subscribe({
      error: () => {
        this.errorMessage.set('Failed to load jobs. Please try again.');
      },
    });
  }

  navigateToAddJob(): void {
    this.router.navigate(['/experience/edit']);
  }

  deleteJob(jobId: string): void {
    if (confirm('Are you sure you want to delete this job? This operation cannot be undone.')) {
      this.jobsService.deleteJob(jobId).subscribe({
        error: () => {
          this.errorMessage.set('Failed to delete job.');
        },
      });
    }
  }
}
