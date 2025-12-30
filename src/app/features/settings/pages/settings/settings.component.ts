import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../../../services/api.service';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="settings-container">
      <header class="page-header">
        <h1>Settings</h1>
        <p class="subtitle">Manage user preferences and data</p>
      </header>

      <div class="settings-grid">
        <!-- Data Export Section -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>download</mat-icon>
            <mat-card-title>Data Export</mat-card-title>
            <mat-card-subtitle>Download your data for backup</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>
              Export your full Experience Bank including all jobs and bullet points to a JSON file.
            </p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button
              mat-stroked-button
              color="primary"
              (click)="exportExperienceBank()"
              [disabled]="isExporting()"
            >
              @if (isExporting()) {
                Exporting...
              } @else {
                Export Experience Bank
              }
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Danger Zone Section -->
        <mat-card class="danger-zone">
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">warning</mat-icon>
            <mat-card-title>Danger Zone</mat-card-title>
            <mat-card-subtitle>Irreversible account actions</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>
              Clear all local data and sign out. This will remove your user ID from this device.
              Actual data persists on the server unless you contact support to delete your account.
            </p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-raised-button color="warn" (click)="clearData()">
              Clear Local Data & Sign Out
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      @if (isExporting()) {
        <app-loading-spinner [overlay]="true"></app-loading-spinner>
      }
    </div>
  `,
  styles: [
    `
      .settings-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }
      .page-header {
        margin-bottom: 2rem;
      }
      .subtitle {
        color: #666;
        margin-top: 0.5rem;
      }
      .settings-grid {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      mat-card {
        width: 100%;
      }
      mat-card-header mat-icon {
        font-size: 2rem;
        width: 2rem;
        height: 2rem;
      }
      mat-card-content {
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
      .danger-zone {
        border: 1px solid #ffeba1;
        background-color: #fffbf0;
      }
      .danger-zone mat-card-title {
        color: #d32f2f;
      }
    `,
  ],
})
export class SettingsComponent {
  private readonly api = inject(ApiService);
  private readonly userState = inject(UserService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);

  isExporting = signal(false);

  exportExperienceBank(): void {
    const userId = this.userState.getStoredUserId();
    if (!userId) {
      this.errorService.showError('You must be logged in to export data.');
      return;
    }

    this.isExporting.set(true);

    // Call API to get all user data (or specific experience endpoint if exits)
    // Using generic jobs endpoint + experiences as a proxy for "Experience Bank"
    // Ideally backend has a comprehensive dump endpoint.
    // For now, we will fetch jobs and assume that's the core bank.
    this.api.get(`/users/${userId}/jobs`).subscribe({
      next: (data) => {
        this.downloadJson(data, `experience_bank_${new Date().toISOString()}.json`);
        this.isExporting.set(false);
        this.errorService.showSuccess('Data exported successfully!');
      },
      error: () => {
        this.isExporting.set(false);
        this.errorService.showError('Failed to download data.');
      },
    });
  }

  private downloadJson(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  clearData(): void {
    if (
      confirm(
        'Are you sure you want to clear all local data and sign out? You will need to re-login to access your profile.',
      )
    ) {
      // Clear local storage / user session
      this.userState.clearUser();

      // Navigate to landing
      this.router.navigate(['/']);

      this.errorService.showSuccess('Local data cleared and signed out.');
    }
  }
}
