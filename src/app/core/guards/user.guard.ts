import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Route guard that checks if a user is registered.
 * Redirects to the register page if no user is set.
 */
export const userGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.currentUser()) {
    return true;
  }

  // Redirect to register page if no user
  return router.createUrlTree(['/register']);
};
