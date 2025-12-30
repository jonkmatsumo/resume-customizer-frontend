import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  template: `
    <div class="landing-container">
      <mat-card class="hero-card">
        <mat-card-content>
          <h1>Resume Customizer</h1>
          <p>Create tailored resumes for every job application</p>
          <div class="actions">
            @if (userState.isAuthenticated()) {
              <button mat-raised-button color="primary" (click)="navigateToProfile()">
                Go to Profile
              </button>
            } @else {
              <button mat-raised-button color="primary" (click)="navigateToRegister()">
                Get Started
              </button>
              <button mat-button (click)="navigateToLogin()">I already have an account</button>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .landing-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 64px);
        padding: 2rem;
      }
      .hero-card {
        max-width: 600px;
        text-align: center;
      }
      .actions {
        margin-top: 2rem;
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
    `,
  ],
})
export class LandingComponent {
  private readonly router = inject(Router);
  readonly userState = inject(UserService);

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
