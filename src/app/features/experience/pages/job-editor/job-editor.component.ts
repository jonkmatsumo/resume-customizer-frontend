import { Component } from '@angular/core';

@Component({
  selector: 'app-job-editor',
  standalone: true,
  template: `
    <div class="job-editor-page">
      <h1>Edit Job Experience</h1>
      <p>Add or edit job details and experience bullets.</p>
    </div>
  `,
  styles: [
    `
      .job-editor-page {
        padding: 2rem;
      }
    `,
  ],
})
export class JobEditorComponent {}
