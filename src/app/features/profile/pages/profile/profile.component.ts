import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="profile-page">
      <h1>User Profile</h1>
      <p>Manage your profile information.</p>
    </div>
  `,
  styles: [
    `
      .profile-page {
        padding: 2rem;
      }
    `,
  ],
})
export class ProfileComponent {}
