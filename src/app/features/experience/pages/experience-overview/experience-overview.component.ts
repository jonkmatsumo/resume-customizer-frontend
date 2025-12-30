import { Component } from '@angular/core';

@Component({
  selector: 'app-experience-overview',
  standalone: true,
  template: `
    <div class="experience-overview-page">
      <h1>Employment History</h1>
      <p>View and manage your work experience.</p>
    </div>
  `,
  styles: [
    `
      .experience-overview-page {
        padding: 2rem;
      }
    `,
  ],
})
export class ExperienceOverviewComponent {}
