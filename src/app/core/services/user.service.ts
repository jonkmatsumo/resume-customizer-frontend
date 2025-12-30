import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../models';
import { ApiService } from '../../services/api.service';
import { Observable, tap } from 'rxjs';

/**
 * Service to manage user state.
 * Uses Angular signals for reactive state management.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api = inject(ApiService);

  // Private writable signal for current user
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal(false);

  // Public readonly computed for current user
  readonly currentUser = computed(() => this._currentUser());
  readonly isLoading = computed(() => this._isLoading());

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

  /**
   * Load user details from API
   */
  loadUser(userId: string): Observable<User> {
    this._isLoading.set(true);
    return this.api.get<User>(`/users/${userId}`).pipe(
      tap({
        next: (user) => {
          this._currentUser.set(user);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false),
      }),
    );
  }

  /**
   * Update user details
   */
  updateUser(userId: string, updates: Partial<User>): Observable<User> {
    this._isLoading.set(true);
    return this.api.put<User>(`/users/${userId}`, updates).pipe(
      tap({
        next: (updatedUser) => {
          this._currentUser.set(updatedUser);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false),
      }),
    );
  }
}
