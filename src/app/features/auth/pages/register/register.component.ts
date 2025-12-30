import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonModule,
    LoadingSpinnerComponent,
    MatIconModule,
    RouterLink,
  ],
  template: `
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Create Your Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field>
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" required />
              @if (registerForm.get('name')?.hasError('required')) {
                <mat-error> Name is required </mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error> Invalid email format </mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                required
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword()"
              >
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Confirm Password</mat-label>
              <input
                matInput
                [type]="hideConfirmPassword() ? 'password' : 'text'"
                formControlName="confirmPassword"
                required
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="toggleConfirmPasswordVisibility()"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hideConfirmPassword()"
              >
                <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('confirmPassword')?.hasError('required')) {
                <mat-error>Confirm Password is required</mat-error>
              }
              @if (registerForm.get('confirmPassword')?.hasError('passwordMismatch')) {
                <mat-error>Passwords do not match</mat-error>
              }
            </mat-form-field>

            <mat-form-field>
              <mat-label>Phone</mat-label>
              <input matInput type="tel" formControlName="phone" />
            </mat-form-field>

            <div class="actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="registerForm.invalid || isLoading()"
              >
                Create Profile
              </button>
              <button mat-button type="button" routerLink="/">Cancel</button>
            </div>

            @if (isLoading()) {
              <app-loading-spinner></app-loading-spinner>
            }
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 64px);
        padding: 2rem;
      }
      mat-card {
        max-width: 500px;
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
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userState = inject(UserService);
  private readonly errorService = inject(ErrorService);

  registerForm: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor() {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        phone: [''],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  private passwordMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Only clear if the specific error exists to avoid clearing other errors (like required)
      if (confirmPassword?.hasError('passwordMismatch')) {
        // If we had more errors on confirmPassword we'd need to be careful, but here it's fine
        // simpler to just re-evaluate required if needed, or assume it's handled by control validators
        confirmPassword.setErrors(null);
      }
    }
    return null;
  };

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      const formValue = this.registerForm.value;

      this.userState
        .register({
          name: formValue.name,
          email: formValue.email,
          password: formValue.password,
          phone: formValue.phone || undefined,
        })
        .subscribe({
          next: () => {
            this.isLoading.set(false);
            this.errorService.showSuccess('Profile created successfully!');
            this.router.navigate(['/profile']);
          },
          error: () => {
            this.isLoading.set(false);
            // Error handled by interceptor
          },
        });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value) => !value);
  }
}
