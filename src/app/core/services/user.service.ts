import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';

/**
 * Service to manage user state.
 * Uses Angular signals for reactive state management.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Private writable signal for current user
  private readonly _currentUser = signal<User | null>(null);

  // Public readonly computed for current user
  readonly currentUser = computed(() => this._currentUser());

  // Computed flag for whether user is logged in
  readonly isLoggedIn = computed(() => this._currentUser() !== null);

  /**
   * Set the current user
   */
  setUser(user: User | null): void {
    this._currentUser.set(user);
    if (user) {
      localStorage.setItem('userId', user.id);
    } else {
      localStorage.removeItem('userId');
    }
  }

  /**
   * Get the stored user ID from localStorage
   */
  getStoredUserId(): string | null {
    return localStorage.getItem('userId');
  }

  /**
   * Clear the current user
   */
  clearUser(): void {
    this._currentUser.set(null);
    localStorage.removeItem('userId');
  }
}
