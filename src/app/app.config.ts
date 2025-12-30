import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
// TODO: provideAnimations is deprecated in Angular 21 in favor of native CSS animations.
// However, Angular Material still requires it. Remove this once Angular Material migrates
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideAnimations()],
};
