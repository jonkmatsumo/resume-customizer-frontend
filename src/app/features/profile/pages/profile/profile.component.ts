import { Component, OnInit, inject, signal } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { User } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  template: `
    <div class="profile-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Your Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content>
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

          @if (profileForm && !userState.isLoading()) {
            <form [formGroup]="profileForm" (ngSubmit)="onSave()">
              <mat-form-field>
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" [readonly]="!isEditing()" />
                @if (profileForm.get('name')?.hasError('required')) {
                  <mat-error> Name is required </mat-error>
                }
              </mat-form-field>

              <mat-form-field>
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" [readonly]="!isEditing()" />
                @if (profileForm.get('email')?.hasError('email')) {
                  <mat-error> Invalid email format </mat-error>
                }
              </mat-form-field>

              <mat-form-field>
                <mat-label>Phone</mat-label>
                <input matInput type="tel" formControlName="phone" [readonly]="!isEditing()" />
              </mat-form-field>

              <div class="actions">
                @if (!isEditing()) {
                  <button mat-raised-button color="primary" (click)="enableEditing()">Edit</button>
                } @else {
                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    [disabled]="profileForm.invalid || isSaving()"
                  >
                    Save
                  </button>
                  <button mat-button type="button" (click)="cancelEditing()">Cancel</button>
                }
              </div>
            </form>

            <div class="password-section">
              <h3>Security</h3>
              @if (!isChangingPassword()) {
                <button mat-stroked-button (click)="enableChangePassword()">Change Password</button>
              } @else if (passwordForm) {
                <form [formGroup]="passwordForm" (ngSubmit)="onSavePassword()">
                  <mat-form-field>
                    <mat-label>Current Password</mat-label>
                    <input matInput type="password" formControlName="currentPassword" />
                    @if (passwordForm.get('currentPassword')?.hasError('required')) {
                      <mat-error>Current password is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field>
                    <mat-label>New Password</mat-label>
                    <input matInput type="password" formControlName="newPassword" />
                    @if (passwordForm.get('newPassword')?.hasError('required')) {
                      <mat-error>New password is required</mat-error>
                    }
                    @if (passwordForm.get('newPassword')?.hasError('minlength')) {
                      <mat-error>Password must be at least 8 characters</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field>
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
                    <button
                      mat-raised-button
                      color="primary"
                      type="submit"
                      [disabled]="passwordForm.invalid || isSavingPassword()"
                    >
                      Update Password
                    </button>
                    <button mat-button type="button" (click)="cancelChangePassword()">
                      Cancel
                    </button>
                  </div>
                </form>
              }
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .profile-container {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }
      mat-card {
        max-width: 600px;
        width: 100%;
      }
      mat-card-content {
        padding-top: 1rem;
      }
      .password-section {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
      }
      h3 {
        margin-bottom: 1rem;
        color: rgba(0, 0, 0, 0.87);
        font-weight: 500;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly userState = inject(UserService); // Made public for template access
  private readonly errorService = inject(ErrorService);

  profileForm?: FormGroup;
  passwordForm?: FormGroup;
  isEditing = signal(false);
  isSaving = signal(false);
  isChangingPassword = signal(false);
  isSavingPassword = signal(false);
  errorMessage = signal<string | undefined>(undefined);
  originalUser?: User;

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
        this.initializeForm(user);
      },
      error: () => {
        this.errorMessage.set('Failed to load profile. Please try again.');
      },
    });
  }

  initializeForm(user: User): void {
    this.profileForm = this.fb.group({
      name: [user.name, Validators.required],
      email: [user.email || '', Validators.email],
      phone: [user.phone || ''],
    });
    this.isEditing.set(false);
  }

  enableEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    if (this.originalUser) {
      this.initializeForm(this.originalUser);
    }
  }

  onSave(): void {
    if (this.profileForm?.valid) {
      if (!this.originalUser?.id) return;

      this.isSaving.set(true);
      const updates = this.profileForm.value;

      this.userState.updateUser(this.originalUser.id, updates).subscribe({
        next: () => {
          this.errorService.showSuccess('Profile updated successfully!');
          this.isEditing.set(false);
          this.isSaving.set(false);
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
    }
  }

  // Password Management
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
}
