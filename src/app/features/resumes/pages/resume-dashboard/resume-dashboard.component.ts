import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RunsService } from '../../../../core/services/runs.service';
import { Run } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { StartResumeDialogComponent } from '../../components/start-resume-dialog/start-resume-dialog.component';

@Component({
  selector: 'app-resume-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Resume Generation</h1>
        <button mat-raised-button color="primary" (click)="openStartDialog()">
          <mat-icon>add</mat-icon>
          Start New Resume
        </button>
      </div>

      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
            <mat-option value="">All</mat-option>
            <mat-option value="queued">Queued</mat-option>
            <mat-option value="running">Running</mat-option>
            <mat-option value="completed">Completed</mat-option>
            <mat-option value="failed">Failed</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Company</mat-label>
          <input
            matInput
            [(ngModel)]="companyFilter"
            (ngModelChange)="applyFilters()"
            placeholder="Filter by company..."
          />
        </mat-form-field>
      </div>

      @if (runsState.isLoading()) {
        <app-loading-spinner></app-loading-spinner>
      }

      @if (!runsState.isLoading() && filteredRuns().length === 0) {
        <app-empty-state
          title="No resume generations"
          message="Start by generating your first resume."
          actionLabel="Start New Resume"
          (onAction)="openStartDialog()"
        ></app-empty-state>
      }

      <div class="runs-list">
        @for (run of filteredRuns(); track run.id) {
          <mat-card class="run-card" (click)="viewRun(run.id)">
            <mat-card-header>
              <mat-card-title>{{ run.company || 'Untitled' }}</mat-card-title>
              <mat-card-subtitle>{{ run.role || 'No role specified' }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <span class="status-badge" [class]="'status-' + run.status">
                {{ run.status }}
              </span>
              <p class="date">{{ formatDate(run.created_at) }}</p>
              <div class="actions">
                <button mat-button (click)="viewRun(run.id); $event.stopPropagation()">View</button>
                @if (run.status === 'completed') {
                  <button mat-button (click)="downloadResume(run.id); $event.stopPropagation()">
                    Download
                  </button>
                }
                <button
                  mat-button
                  color="warn"
                  (click)="deleteRun(run.id); $event.stopPropagation()"
                >
                  Delete
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }
      .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .filters mat-form-field {
        width: 200px;
      }
      .runs-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .run-card {
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .run-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .status-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 16px;
        font-size: 0.85rem;
        font-weight: 500;
        text-transform: capitalize;
        margin-bottom: 0.5rem;
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
      .date {
        color: #777;
        font-size: 0.9rem;
        margin-top: 0.5rem;
      }
      .actions {
        margin-top: 1rem;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
    `,
  ],
})
export class ResumeDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  public readonly runsState = inject(RunsService);

  statusFilter = '';
  companyFilter = '';
  filteredRuns = signal<Run[]>([]);

  ngOnInit(): void {
    this.loadRuns();
  }

  loadRuns(): void {
    this.runsState.loadRuns().subscribe({
      next: (runs) => {
        this.filteredRuns.set(runs);
      },
    });
  }

  applyFilters(): void {
    const runs = this.runsState.runs();
    let filtered = runs;

    if (this.statusFilter) {
      filtered = filtered.filter((run) => run.status === this.statusFilter);
    }

    if (this.companyFilter) {
      const term = this.companyFilter.toLowerCase();
      filtered = filtered.filter((run) => run.company?.toLowerCase().includes(term));
    }

    this.filteredRuns.set(filtered);
  }

  openStartDialog(): void {
    const dialogRef = this.dialog.open(StartResumeDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadRuns();
      }
    });
  }

  viewRun(runId: string): void {
    this.router.navigate(['/resumes', runId]);
  }

  downloadResume(runId: string): void {
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
        console.error(err);
        // Handle error (e.g. show snackbar)
      },
    });
  }

  deleteRun(runId: string): void {
    if (confirm('Are you sure you want to delete this run?')) {
      this.runsState.deleteRun(runId).subscribe({
        next: () => {
          this.loadRuns();
        },
      });
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
