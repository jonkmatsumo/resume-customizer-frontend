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
            errorMessage = error.error?.message || 'Bad request';
            break;
          case 401:
            errorMessage = 'Unauthorized. Please log in.';
            userService.logout();
            router.navigate(['/login']);
            break;
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
