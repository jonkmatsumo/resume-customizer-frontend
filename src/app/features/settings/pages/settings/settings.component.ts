import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="settings-page">
      <h1>Settings</h1>
      <p>Configure your application preferences.</p>
    </div>
  `,
  styles: [
    `
      .settings-page {
        padding: 2rem;
      }
    `,
  ],
})
export class SettingsComponent {}
