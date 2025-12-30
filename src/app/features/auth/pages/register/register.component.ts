import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  template: `
    <div class="register-page">
      <h1>Create Your Profile</h1>
      <p>Enter your details to get started.</p>
    </div>
  `,
  styles: [
    `
      .register-page {
        text-align: center;
        padding: 2rem;
      }
    `,
  ],
})
export class RegisterComponent {}
