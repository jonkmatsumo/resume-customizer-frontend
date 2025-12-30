import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
    RouterLink,
  ],
  template: `
    <div class="login-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Welcome Back</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field>
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required />
              @if (loginForm.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>Invalid email format</mat-error>
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
              @if (loginForm.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <div class="actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
              >
                @if (isLoading()) {
                  <span class="spinner-wrapper">Signing in...</span>
                } @else {
                  Sign In
                }
              </button>
            </div>

            <div class="links">
              <p>Don't have an account? <a routerLink="/register">Sign up</a></p>
            </div>

            @if (isLoading()) {
              <app-loading-spinner [overlay]="true"></app-loading-spinner>
            }
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 64px);
        padding: 2rem;
        background-color: #f5f5f5;
      }
      mat-card {
        max-width: 400px;
        width: 100%;
        padding: 2rem;
      }
      mat-card-header {
        margin-bottom: 1.5rem;
        justify-content: center;
        text-align: center;
      }
      mat-card-content {
        display: flex;
        flex-direction: column;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .actions {
        display: flex;
        flex-direction: column;
        margin-top: 1rem;
      }
      button[type='submit'] {
        width: 100%;
        height: 48px;
        font-size: 1.1rem;
      }
      .links {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.9rem;
        color: #666;
      }
      a {
        color: #3f51b5;
        cursor: pointer;
        text-decoration: none;
        font-weight: 500;
        &:hover {
          text-decoration: underline;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly errorService = inject(ErrorService);

  loginForm: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      const { email, password } = this.loginForm.value;

      this.userService.login(email, password).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.errorService.showSuccess('Welcome back!');
          this.router.navigate(['/profile']);
        },
        error: () => {
          this.isLoading.set(false);
          // Error is also handled by global interceptor, but we can show specific form errors if needed
          // For now, global error service handling is sufficient for generic auth errors
        },
      });
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }
}
