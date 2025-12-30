import { Component } from '@angular/core';

@Component({
  selector: 'app-resume-dashboard',
  standalone: true,
  template: `
    <div class="resume-dashboard-page">
      <h1>Resume Generation</h1>
      <p>Create and manage your customized resumes.</p>
    </div>
  `,
  styles: [
    `
      .resume-dashboard-page {
        padding: 2rem;
      }
    `,
  ],
})
export class ResumeDashboardComponent {}
