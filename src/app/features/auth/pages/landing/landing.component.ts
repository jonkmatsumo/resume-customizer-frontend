import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <div class="landing-page">
      <h1>Welcome to Resume Customizer</h1>
      <p>Create tailored resumes for any job posting.</p>
    </div>
  `,
  styles: [
    `
      .landing-page {
        text-align: center;
        padding: 2rem;
      }
    `,
  ],
})
export class LandingComponent {}
