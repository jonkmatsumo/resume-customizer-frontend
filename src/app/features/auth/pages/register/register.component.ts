import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { User } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

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
    LoadingSpinnerComponent,
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
              <button mat-button type="button" (click)="onCancel()">Cancel</button>
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
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly userState = inject(UserService);
  private readonly errorService = inject(ErrorService);

  registerForm: FormGroup;
  isLoading = signal(false);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: [''],
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      const formValue = this.registerForm.value;

      this.api
        .post<User>('/users', {
          name: formValue.name,
          email: formValue.email || undefined,
          phone: formValue.phone || undefined,
        })
        .subscribe({
          next: (user: User) => {
            this.userState.setUser(user);
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

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
