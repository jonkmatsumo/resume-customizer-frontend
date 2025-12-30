import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Centralized service for displaying success and error messages via Snackbars.
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Show an error message.
   * @param message Text to display
   * @param action Action button label (default: 'Close')
   */
  showError(message: string, action = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Show a success message.
   * @param message Text to display
   * @param action Action button label (default: 'Close')
   */
  showSuccess(message: string, action = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }
}
