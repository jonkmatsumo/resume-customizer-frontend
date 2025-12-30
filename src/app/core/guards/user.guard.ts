import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Route guard that checks if a user is authenticated.
 * Redirects to the login page if not authenticated.
 */
export const userGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isAuthenticated()) {
    return true;
  }

  // Redirect to login page if no user
  return router.createUrlTree(['/login']);
};
