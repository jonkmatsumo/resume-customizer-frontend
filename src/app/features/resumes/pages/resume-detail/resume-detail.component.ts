import { Component } from '@angular/core';

@Component({
  selector: 'app-resume-detail',
  standalone: true,
  template: `
    <div class="resume-detail-page">
      <h1>Resume Details</h1>
      <p>View the details and artifacts of a resume generation run.</p>
    </div>
  `,
  styles: [
    `
      .resume-detail-page {
        padding: 2rem;
      }
    `,
  ],
})
export class ResumeDetailComponent {}
