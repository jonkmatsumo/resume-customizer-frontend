import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { RunsService } from '../../../../core/services/runs.service';
import { Run, Artifact, RunStepsResponse, StepStatus } from '../../../../core/models';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { NgxKatexComponent } from 'ngx-katex';

@Component({
  selector: 'app-resume-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatIconModule,
    MatIconModule,
    SkeletonLoaderComponent,
    NgxKatexComponent,
  ],
  template: `
    <div class="detail-container">
      @if (error()) {
        <mat-card class="error-card">
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">error</mat-icon>
            <mat-card-title>Resume Not Found</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="error-message">
              {{ error() }}
            </p>
            <div class="actions">
              <button mat-raised-button color="primary" (click)="goBack()">
                Back to Dashboard
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      } @else if (runBasicInfo()) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ runBasicInfo()?.company || 'Untitled' }}</mat-card-title>
            <mat-card-subtitle>{{ runBasicInfo()?.role || 'No role specified' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="status-section">
              <span class="status-badge" [class]="'status-' + runSteps()?.status">
                {{ runSteps()?.status }}
              </span>
              <p>Created: {{ formatDate(runBasicInfo()?.created_at) }}</p>
            </div>

            @if (runSteps()) {
              <div class="steps-section">
                <h3>Pipeline Steps</h3>

                <!-- Summary counts -->
                @if (runSteps()?.summary) {
                  <div class="summary-stats">
                    <span class="stat-item">
                      <strong>{{ runSteps()?.summary?.completed }}</strong> completed
                    </span>
                    <span class="stat-item">
                      <strong>{{ runSteps()?.summary?.failed }}</strong> failed
                    </span>
                    <span class="stat-item">
                      <strong>{{ runSteps()?.summary?.in_progress }}</strong> in progress
                    </span>
                    <span class="stat-item">
                      <strong>{{ runSteps()?.summary?.pending }}</strong> pending
                    </span>
                  </div>
                }

                <!-- Steps list (simple list format) -->
                <div class="steps-list">
                  @for (step of runSteps()?.steps; track step.step) {
                    <div class="step-item" [class]="'step-' + step.status">
                      <div class="step-header">
                        <mat-icon class="step-icon">{{ getStepIcon(step.status) }}</mat-icon>
                        <span class="step-name">{{ formatStepName(step.step) }}</span>
                        <span class="step-status-badge" [class]="'status-' + step.status">
                          {{ step.status }}
                        </span>
                      </div>

                      @if (step.error) {
                        <div class="step-error">
                          <mat-icon>error</mat-icon>
                          <span>{{ step.error }}</span>
                        </div>
                      }

                      @if (step.duration_ms) {
                        <div class="step-timing">
                          Duration: {{ formatDuration(step.duration_ms) }}
                        </div>
                      }

                      @if (step.started_at) {
                        <div class="step-timing">Started: {{ formatDate(step.started_at) }}</div>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            @if (artifacts().length > 0) {
              <div class="artifacts-section">
                <h3>Artifacts</h3>
                <mat-accordion>
                  @for (artifact of artifacts(); track artifact.id) {
                    <mat-expansion-panel>
                      <mat-expansion-panel-header>
                        <mat-panel-title>{{ artifact.step }}</mat-panel-title>
                        <mat-panel-description>{{ artifact.category }}</mat-panel-description>
                      </mat-expansion-panel-header>
                      <pre class="json-content">{{ formatArtifact(artifact) }}</pre>
                    </mat-expansion-panel>
                  }
                </mat-accordion>
              </div>
            }

            <div class="actions">
              @if (runSteps()?.status === 'completed') {
                <div class="resume-section">
                  <h3>Resume Content</h3>

                  @if (showResumePreview() && resumeText()) {
                    <!-- Inline expansion of resume preview -->
                    <div class="resume-preview">
                      <div class="resume-actions">
                        <button mat-button (click)="showResumePreview.set(false)">
                          Hide Preview
                        </button>
                        <button mat-button (click)="downloadResume()">Download LaTeX</button>
                      </div>
                      <div class="latex-render-container">
                        <ngx-katex
                          [equation]="resumeText() || ''"
                          [options]="{ throwOnError: false, displayMode: true }"
                        ></ngx-katex>
                      </div>
                      <mat-expansion-panel class="source-code-panel">
                        <mat-expansion-panel-header>
                          <mat-panel-title>View LaTeX Source</mat-panel-title>
                        </mat-expansion-panel-header>
                        <pre class="latex-content">{{ resumeText() }}</pre>
                      </mat-expansion-panel>
                    </div>
                  } @else {
                    <div class="resume-actions">
                      <button mat-raised-button color="primary" (click)="loadResumeText()">
                        View Resume Content
                      </button>
                      <button mat-button (click)="downloadResume()">Download LaTeX</button>
                    </div>
                  }
                </div>
              }
              <button mat-button (click)="goBack()">Back to Dashboard</button>
            </div>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="skeleton-container">
          <app-skeleton-loader type="title" width="60%"></app-skeleton-loader>
          <app-skeleton-loader type="text" width="40%"></app-skeleton-loader>
          <div style="margin-top: 2rem">
            <app-skeleton-loader type="card" height="300px"></app-skeleton-loader>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .detail-container {
        padding: 2rem;
        max-width: 1000px;
        margin: 0 auto;
      }
      .error-card {
        border-left: 4px solid #f44336;
      }
      .error-message {
        margin: 1rem 0 2rem;
        color: #555;
        font-size: 1.1rem;
      }
      .status-section {
        margin-top: 1rem;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }
      .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 16px;
        font-weight: 500;
        text-transform: capitalize;
      }
      .status-queued {
        background-color: #e0e0e0;
        color: #555;
      }
      .status-running {
        background-color: #e3f2fd;
        color: #1976d2;
      }
      .status-completed {
        background-color: #e8f5e9;
        color: #388e3c;
      }
      .status-failed {
        background-color: #ffebee;
        color: #d32f2f;
      }

      .steps-section {
        margin-bottom: 2rem;
      }

      .summary-stats {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: #f5f5f5;
        border-radius: 4px;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .steps-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .step-item {
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        border-left: 4px solid #e0e0e0;
      }

      .step-item.step-completed {
        border-left-color: #4caf50;
        background-color: #f1f8e9;
      }

      .step-item.step-failed {
        border-left-color: #f44336;
        background-color: #ffebee;
      }

      .step-item.step-in_progress {
        border-left-color: #2196f3;
        background-color: #e3f2fd;
      }

      .step-item.step-pending {
        border-left-color: #9e9e9e;
        background-color: #fafafa;
      }

      .step-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .step-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .step-name {
        flex: 1;
        font-weight: 500;
      }

      .step-status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        text-transform: capitalize;
      }

      .step-error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background-color: #ffebee;
        border-radius: 4px;
        color: #c62828;
      }

      .step-timing {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #666;
      }

      .artifacts-section {
        margin-bottom: 2rem;
      }
      .json-content {
        background-color: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.9rem;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        flex-direction: column;
        align-items: flex-end;
      }

      .resume-section {
        width: 100%;
        margin-bottom: 2rem;
      }

      .resume-preview {
        margin-top: 1rem;
      }

      .resume-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        justify-content: flex-end;
      }

      .latex-content {
        background-color: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.875rem;
        font-family: 'Courier New', monospace;
        max-height: 600px;
        overflow-y: auto;
        white-space: pre-wrap;
      }
    `,
  ],
})
export class ResumeDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly runsState = inject(RunsService);

  runSteps = signal<RunStepsResponse | null>(null);
  runBasicInfo = signal<Run | null>(null);
  error = signal<string | null>(null);
  artifacts = signal<Artifact[]>([]);
  resumeText = signal<string | null>(null);
  showResumePreview = signal(false);

  private pollingInterval?: ReturnType<typeof setInterval>;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    const runId = this.route.snapshot.paramMap.get('runId');
    if (runId) {
      this.loadRunSteps(runId);
      this.loadArtifacts(runId);
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.subscriptions.unsubscribe();
  }

  loadRunSteps(runId: string): void {
    this.error.set(null);
    this.runsState.getRunSteps(runId).subscribe({
      next: (response) => {
        this.runSteps.set(response);

        if (response.status === 'running') {
          this.setupPolling(runId);
        }
      },
      error: (err) => {
        console.error('Error loading run steps:', err);
        const errorMsg =
          err.error?.message || 'Failed to load run details. Some information may be unavailable.';
        this.error.set(errorMsg);
      },
    });

    this.loadRunBasicInfo(runId);
  }

  loadRunBasicInfo(runId: string): void {
    this.runsState.getRunBasicInfo(runId).subscribe({
      next: (run) => {
        this.runBasicInfo.set(run);
      },
      error: () => {
        // Non-fatal - basic info is optional, can proceed with partial data
      },
    });
  }

  loadResumeText(): void {
    const runId = this.runSteps()?.run_id;
    if (!runId) return;

    this.runsState.getResumeText(runId).subscribe({
      next: (text) => {
        this.resumeText.set(text);
        this.showResumePreview.set(true);
      },
      error: (err) => {
        console.error('Error loading resume text:', err);
        // Allow download to proceed even if preview fails
        this.error.set('Failed to load resume preview, but download is still available.');
      },
    });
  }

  loadArtifacts(runId: string): void {
    this.runsState.getArtifacts(runId).subscribe({
      next: (artifacts) => {
        this.artifacts.set(artifacts);
      },
      error: () => {
        // Artifacts might not exist yet or fail
      },
    });
  }

  setupPolling(runId: string): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      const currentStatus = this.runSteps()?.status;

      if (
        currentStatus === 'completed' ||
        currentStatus === 'failed' ||
        currentStatus === 'canceled'
      ) {
        this.stopPolling();
        return;
      }

      this.runsState.getRunSteps(runId).subscribe({
        next: (response) => {
          this.runSteps.set(response);

          if (response.status !== 'running') {
            this.stopPolling();
          }

          // Refresh artifacts if needed
          const hasNewCompletedSteps = response.steps.some(
            (step) => step.status === 'completed' && step.artifact_id,
          );
          if (hasNewCompletedSteps) {
            this.loadArtifacts(runId);
          }
        },
        error: () => {
          this.stopPolling();
        },
      });
    }, 3000);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }
  }

  downloadResume(): void {
    const runId = this.runSteps()?.run_id;
    if (!runId) return;

    this.runsState.downloadResume(runId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-${runId}.tex`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading resume:', err);
        this.error.set('Failed to download resume. Please check your connection and try again.');
      },
    });
  }

  formatDate(date?: string): string {
    return date ? new Date(date).toLocaleString() : '';
  }

  formatArtifact(artifact: Artifact): string {
    return JSON.stringify(artifact.content, null, 2);
  }

  goBack(): void {
    this.router.navigate(['/resumes']);
  }

  getStepIcon(status: StepStatus): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'hourglass_empty';
      case 'pending':
        return 'schedule';
      case 'blocked':
        return 'block';
      case 'skipped':
        return 'skip_next';
      default:
        return 'help';
    }
  }

  formatStepName(stepName: string): string {
    return stepName;
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}
