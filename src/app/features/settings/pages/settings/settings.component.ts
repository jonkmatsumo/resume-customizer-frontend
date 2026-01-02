import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../../services/api.service';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { User } from '../../../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  template: `
    <div class="settings-container">
      <header class="page-header">
        <h1>Settings</h1>
        <p class="subtitle">Manage your profile and preferences</p>
      </header>

      @if (userState.isLoading()) {
        <app-loading-spinner></app-loading-spinner>
      }

      @if (errorMessage()) {
        <app-error-message
          [message]="errorMessage()!"
          [showRetry]="true"
          (onRetry)="loadProfile()"
        ></app-error-message>
      }

      <div class="settings-grid">
        <!-- Profile Information Section -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">person</mat-icon>
            <mat-card-title>Profile Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (profileForm && !userState.isLoading()) {
              <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Name</mat-label>
                  <input matInput formControlName="name" [readonly]="!isEditingProfile()" />
                  @if (profileForm.get('name')?.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input
                    matInput
                    type="email"
                    formControlName="email"
                    [readonly]="!isEditingProfile()"
                  />
                  @if (profileForm.get('email')?.hasError('email')) {
                    <mat-error>Invalid email format</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Phone</mat-label>
                  <input
                    matInput
                    type="tel"
                    formControlName="phone"
                    [readonly]="!isEditingProfile()"
                  />
                </mat-form-field>

                <div class="actions">
                  @if (!isEditingProfile()) {
                    <button
                      mat-stroked-button
                      color="primary"
                      type="button"
                      (click)="enableEditingProfile()"
                    >
                      Edit Profile
                    </button>
                  } @else {
                    <button mat-button type="button" (click)="cancelEditingProfile()">
                      Cancel
                    </button>
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="profileForm.invalid || isSavingProfile()"
                    >
                      Save Changes
                    </button>
                  }
                </div>
              </form>
            }
          </mat-card-content>
        </mat-card>

        <!-- Security Section -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">lock</mat-icon>
            <mat-card-title>Security</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (!isChangingPassword()) {
              <p>Update your password to keep your account secure.</p>
              <div class="actions">
                <button mat-stroked-button (click)="enableChangePassword()">Change Password</button>
              </div>
            } @else if (passwordForm) {
              <form [formGroup]="passwordForm" (ngSubmit)="onSavePassword()">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Current Password</mat-label>
                  <input matInput type="password" formControlName="currentPassword" />
                  @if (passwordForm.get('currentPassword')?.hasError('required')) {
                    <mat-error>Current password is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>New Password</mat-label>
                  <input matInput type="password" formControlName="newPassword" />
                  @if (passwordForm.get('newPassword')?.hasError('required')) {
                    <mat-error>New password is required</mat-error>
                  }
                  @if (passwordForm.get('newPassword')?.hasError('minlength')) {
                    <mat-error>Password must be at least 8 characters</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirm New Password</mat-label>
                  <input matInput type="password" formControlName="confirmNewPassword" />
                  @if (passwordForm.get('confirmNewPassword')?.hasError('required')) {
                    <mat-error>Confirm password is required</mat-error>
                  }
                  @if (passwordForm.get('confirmNewPassword')?.hasError('passwordMismatch')) {
                    <mat-error>Passwords do not match</mat-error>
                  }
                </mat-form-field>

                <div class="actions">
                  <button mat-button type="button" (click)="cancelChangePassword()">Cancel</button>
                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    [disabled]="passwordForm.invalid || isSavingPassword()"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            }
          </mat-card-content>
        </mat-card>

        <!-- Data Export Section -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>download</mat-icon>
            <mat-card-title>Data Export</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>
              Export your full Experience Bank including all jobs and bullet points to a JSON file.
            </p>
            <div class="actions">
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
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Danger Zone Section -->
        <mat-card class="danger-zone">
          <mat-card-header>
            <mat-icon mat-card-avatar color="warn">warning</mat-icon>
            <mat-card-title>Danger Zone</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>
              Clear all local data and sign out. This will remove your user ID from this device.
              Actual data persists on the server unless you contact support to delete your account.
            </p>
            <div class="actions">
              <button mat-raised-button color="warn" (click)="clearData()">
                Clear Local Data & Sign Out
              </button>
            </div>
          </mat-card-content>
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
        padding-bottom: 4rem;
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
        gap: 2rem;
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
      .full-width {
        width: 100%;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
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
export class SettingsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly userState = inject(UserService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);
  private readonly fb = inject(FormBuilder);

  // Profile State
  profileForm?: FormGroup;
  passwordForm?: FormGroup;
  isEditingProfile = signal(false);
  isSavingProfile = signal(false);
  isChangingPassword = signal(false);
  isSavingPassword = signal(false);
  errorMessage = signal<string | undefined>(undefined);
  originalUser?: User;

  // Settings State
  isExporting = signal(false);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    if (!this.userState.isAuthenticated()) {
      this.errorMessage.set('Not authenticated. Please log in.');
      return;
    }

    this.errorMessage.set(undefined);
    this.userState.loadCurrentUser().subscribe({
      next: (user) => {
        this.originalUser = user;
        this.initializeProfileForm(user);
      },
      error: () => {
        this.errorMessage.set('Failed to load profile. Please try again.');
      },
    });
  }

  // --- Profile Management ---

  initializeProfileForm(user: User): void {
    this.profileForm = this.fb.group({
      name: [user.name, Validators.required],
      email: [user.email || '', Validators.email],
      phone: [user.phone || ''],
    });
    this.isEditingProfile.set(false);
  }

  enableEditingProfile(): void {
    this.isEditingProfile.set(true);
  }

  cancelEditingProfile(): void {
    this.isEditingProfile.set(false);
    if (this.originalUser) {
      this.initializeProfileForm(this.originalUser);
    }
  }

  onSaveProfile(): void {
    if (this.profileForm?.valid) {
      if (!this.originalUser?.id) return;

      this.isSavingProfile.set(true);
      const updates = this.profileForm.value;

      this.userState.updateUser(this.originalUser.id, updates).subscribe({
        next: () => {
          this.errorService.showSuccess('Profile updated successfully!');
          this.isEditingProfile.set(false);
          this.isSavingProfile.set(false);
        },
        error: () => {
          this.isSavingProfile.set(false);
        },
      });
    }
  }

  // --- Password Management ---

  enableChangePassword(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmNewPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
    this.isChangingPassword.set(true);
  }

  cancelChangePassword(): void {
    this.isChangingPassword.set(false);
    this.passwordForm = undefined;
  }

  onSavePassword(): void {
    if (this.passwordForm?.valid) {
      this.isSavingPassword.set(true);
      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userState
        .updatePassword({
          current_password: currentPassword,
          new_password: newPassword,
        })
        .subscribe({
          next: () => {
            this.errorService.showSuccess('Password updated successfully!');
            this.isChangingPassword.set(false);
            this.passwordForm = undefined;
            this.isSavingPassword.set(false);
          },
          error: () => {
            this.isSavingPassword.set(false);
          },
        });
    }
  }

  private passwordMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmNewPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  };

  // --- Export & Data Management ---

  exportExperienceBank(): void {
    const userId = this.userState.getStoredUserId();
    if (!userId) {
      this.errorService.showError('You must be logged in to export data.');
      return;
    }

    this.isExporting.set(true);

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
      this.userState.logout();
      this.router.navigate(['/']);
      this.errorService.showSuccess('Local data cleared and signed out.');
    }
  }
}
