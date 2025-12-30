import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { RunsService } from '../../../../core/services/runs.service';
import { ApiService } from '../../../../services/api.service';
import { Run, Artifact } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';

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
    LoadingSpinnerComponent,
    SkeletonLoaderComponent,
  ],
  template: `
    <div class="detail-container">
      @if (run()) {
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ run()?.company || 'Untitled' }}</mat-card-title>
            <mat-card-subtitle>{{ run()?.role || 'No role specified' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="status-section">
              <span class="status-badge" [class]="'status-' + run()?.status">
                {{ run()?.status }}
              </span>
              <p>Created: {{ formatDate(run()?.created_at) }}</p>
            </div>

            @if (run()?.status === 'running') {
              <div class="progress-section">
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                <p>{{ currentStep() }}</p>
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
              @if (run()?.status === 'completed') {
                <button mat-raised-button color="primary" (click)="downloadResume()">
                  Download LaTeX
                </button>
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

      .progress-section {
        margin-bottom: 2rem;
      }
      .progress-section p {
        margin-top: 0.5rem;
        color: #666;
        font-style: italic;
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
      }
    `,
  ],
})
export class ResumeDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly runsState = inject(RunsService);
  private readonly api = inject(ApiService);

  run = signal<Run | null>(null);
  artifacts = signal<Artifact[]>([]);
  currentStep = signal<string>('Initializing...');
  private eventSource?: EventSourcePolyfill;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    const runId = this.route.snapshot.paramMap.get('runId');
    if (runId) {
      this.loadRun(runId);
      this.loadArtifacts(runId);
    }
  }

  ngOnDestroy(): void {
    this.closeSSE();
    this.subscriptions.unsubscribe();
  }

  closeSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  loadRun(runId: string): void {
    this.runsState.getRunStatus(runId).subscribe({
      next: (run) => {
        this.run.set(run);
        if (run.status === 'running') {
          this.setupSSE(runId);
        }
      },
      error: () => {
        // Handle error
      },
    });
  }

  loadArtifacts(runId: string): void {
    this.runsState.getArtifacts(runId).subscribe({
      next: (artifacts) => {
        this.artifacts.set(artifacts);
      },
    });
  }

  setupSSE(runId: string): void {
    // Re-connect to stream to listen for updates.
    // NOTE: The current backend design might only stream during creation POST.
    // If backend supports re-attaching to stream via GET /run/:id/stream, we'd use that.
    // Since I don't see a GET stream endpoint in previous context, this might be a limitation.
    // However, for verify/demo, assuming polling or just initial state might be needed if stream is lost.

    // PROPOSED: If status is running, we should poll status every few seconds as fallback if no stream endpoint.
    // Or assuming the /run/stream endpoint allows "listening" to an active run.

    // Let's implement active polling for status updates if running, as it's more robust than assuming SSE re-attach without specific API support.
    // But since user requested SSE, I will try to support it if possible.
    // Given the dialog implemented POST connection, likely the connection is lost on nav.
    // If the requirements implied SSE on detail page, the backend needs a GET stream support.

    // Fallback: Poll status every 5 seconds until completed.
    const intervalId = setInterval(() => {
      if (this.run()?.status === 'completed' || this.run()?.status === 'failed') {
        clearInterval(intervalId);
        return;
      }

      this.runsState.getRunStatus(runId).subscribe((updatedRun) => {
        this.run.set(updatedRun);
        // Refresh artifacts as well if they might appear
        this.loadArtifacts(runId);

        if (updatedRun.status !== 'running') {
          clearInterval(intervalId);
        }
      });
    }, 3000);

    this.subscriptions.add(new Subscription(() => clearInterval(intervalId)));
  }

  downloadResume(): void {
    const runId = this.run()?.id;
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
}
