import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

/**
 * Global error interceptor.
 * Catches HTTP errors and displays a user-friendly snackbar notification.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const userService = inject(UserService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        switch (error.status) {
          case 400:
            // Check if it's a validation error with field details
            if (error.error?.errors && Array.isArray(error.error.errors)) {
              const fieldErrors = error.error.errors
                .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
                .join(', ');
              errorMessage = `Validation error: ${fieldErrors}`;
            } else {
              errorMessage = error.error?.message || 'Bad request';
            }
            break;
          case 401: {
            // Check if token exists (might be expired)
            const token = userService.getAuthToken();
            if (token) {
              errorMessage = 'Your session has expired. Please log in again.';
            } else {
              errorMessage = 'Unauthorized. Please log in.';
            }
            userService.logout();
            router.navigate(['/login']);
            break;
          }
          case 403:
            errorMessage = 'Forbidden. You do not have permission.';
            userService.logout(); // Optional: might just redirect or show error
            router.navigate(['/login']);
            break;
          case 404:
            errorMessage = error.error?.message || 'Resource not found';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflict. Resource already exists.';
            break;
          case 429: {
            const retryAfter = error.headers?.get('Retry-After');
            let rateLimitMessage = 'Too many requests. Please try again later.';
            if (retryAfter) {
              const minutes = Math.ceil(parseInt(retryAfter, 10) / 60);
              rateLimitMessage = `Too many requests. Please try again in ${minutes} minute(s).`;
            }
            errorMessage = rateLimitMessage;
            break;
          }
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error: ${error.status}`;
        }
      }

      snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });

      return throwError(() => error);
    }),
  );
};
