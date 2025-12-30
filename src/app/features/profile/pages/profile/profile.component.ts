import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  isEditing = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | undefined>(undefined);
  originalUser?: User;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const userId = this.userState.getStoredUserId();
    if (!userId) {
      this.errorMessage.set('No user ID found. Please register first.');
      return;
    }

    this.errorMessage.set(undefined);
    this.userState.loadUser(userId).subscribe({
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
      const userId = this.userState.getStoredUserId();
      if (!userId) return;

      this.isSaving.set(true);
      const updates = this.profileForm.value;

      this.userState.updateUser(userId, updates).subscribe({
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
}
