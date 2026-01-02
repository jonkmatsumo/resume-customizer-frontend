import { Routes } from '@angular/router';
import { userGuard } from './core/guards/user.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/pages/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [userGuard],
  },
  {
    path: 'experience',
    loadComponent: () =>
      import('./features/experience/pages/experience-overview/experience-overview.component').then(
        (m) => m.ExperienceOverviewComponent,
      ),
    canActivate: [userGuard],
  },
  {
    path: 'experience/edit/:jobId',
    loadComponent: () =>
      import('./features/experience/pages/job-editor/job-editor.component').then(
        (m) => m.JobEditorComponent,
      ),
    canActivate: [userGuard],
  },
  {
    path: 'experience/edit',
    loadComponent: () =>
      import('./features/experience/pages/job-editor/job-editor.component').then(
        (m) => m.JobEditorComponent,
      ),
    canActivate: [userGuard],
  },
  {
    path: 'resumes',
    loadComponent: () =>
      import('./features/resumes/pages/resume-dashboard/resume-dashboard.component').then(
        (m) => m.ResumeDashboardComponent,
      ),
    canActivate: [userGuard],
  },
  {
    path: 'resumes/new',
    loadComponent: () =>
      import('./features/resumes/pages/start-resume/start-resume.component').then(
        (m) => m.StartResumeComponent,
      ),
    canActivate: [userGuard],
  },
  {
    path: 'resumes/:runId',
    loadComponent: () =>
      import('./features/resumes/pages/resume-detail/resume-detail.component').then(
        (m) => m.ResumeDetailComponent,
      ),
    canActivate: [userGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/pages/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
    canActivate: [userGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
