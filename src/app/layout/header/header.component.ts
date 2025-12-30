import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
        <a mat-button routerLink="/profile" routerLinkActive="active">Profile</a>
        <a mat-button routerLink="/experience" routerLinkActive="active">Experience</a>
        <a mat-button routerLink="/resumes" routerLinkActive="active">Resumes</a>
        <a mat-button routerLink="/settings" routerLinkActive="active">Settings</a>
      </nav>
      <span class="spacer"></span>
      @if (userState.currentUser(); as user) {
        <span class="user-info">
          {{ user.email }}
        </span>
      }
      @if (!userState.isLoggedIn()) {
        <a mat-button routerLink="/auth/register">Register</a>
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
}
