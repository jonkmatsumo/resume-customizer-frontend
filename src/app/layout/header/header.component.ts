import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="logo">Resume Customizer</span>
      <span class="spacer"></span>
      <nav>
        @if (userState.isAuthenticated()) {
          <a mat-button routerLink="/profile" routerLinkActive="active">Profile</a>
          <a mat-button routerLink="/experience" routerLinkActive="active">Experience</a>
          <a mat-button routerLink="/resumes" routerLinkActive="active">Resumes</a>
          <a mat-button routerLink="/settings" routerLinkActive="active">Settings</a>
        }
      </nav>
      <span class="spacer"></span>
      @if (userState.isAuthenticated()) {
        <span class="user-info">
          {{ userState.currentUser()?.email }}
        </span>
        <button mat-button (click)="logout()">Logout</button>
      } @else {
        <a mat-button routerLink="/login">Login</a>
        <a mat-button routerLink="/register">Register</a>
      }
    </mat-toolbar>
  `,
  styles: [
    `
      .spacer {
        flex: 1 1 auto;
      }
      .logo {
        font-weight: bold;
        margin-right: 2rem;
      }
      .active {
        background-color: rgba(255, 255, 255, 0.1);
      }
      .user-info {
        margin-right: 1rem;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class HeaderComponent {
  readonly userState = inject(UserService);
  private readonly router = inject(Router);

  logout(): void {
    this.userState.logout();
    this.router.navigate(['/login']);
  }
}
