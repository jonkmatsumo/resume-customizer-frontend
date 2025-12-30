import { Component, OnInit, inject } from '@angular/core';
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
            <button mat-raised-button color="primary" (click)="navigateToRegister()">
              Get Started
            </button>
            @if (hasUser) {
              <button mat-button (click)="navigateToProfile()">I already have an account</button>
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
export class LandingComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly userState = inject(UserService);

  hasUser = false;

  ngOnInit(): void {
    const userId = this.userState.getStoredUserId();
    this.hasUser = !!userId;
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
