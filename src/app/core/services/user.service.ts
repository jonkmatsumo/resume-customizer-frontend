import { Injectable, signal, computed, inject } from '@angular/core';
import {
  User,
  LoginResponse,
  CreateUserRequest,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
} from '../models';
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

  // Expose auth token helper
  readonly isAuthenticated = computed(() => !!this.api.getAuthToken());

  constructor() {
    // Attempt to restore user from storage on init if needed
    // For now, we rely on the app initializer or route guards to trigger loadUser
  }

  /**
   * Set the current user and optionally the token
   */
  setUser(user: User | null, token?: string): void {
    this._currentUser.set(user);
    if (user) {
      localStorage.setItem('userId', user.id);
    } else {
      localStorage.removeItem('userId');
    }

    if (token) {
      this.api.setAuthToken(token);
    }
  }

  /**
   * Get the stored user ID from localStorage
   */
  getStoredUserId(): string | null {
    return localStorage.getItem('userId');
  }

  /**
   * Clear the current user and token
   */
  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem('userId');
    this.api.clearAuthToken();
  }

  /**
   * Register a new user
   */
  register(data: CreateUserRequest): Observable<LoginResponse> {
    this._isLoading.set(true);
    return this.api.post<LoginResponse>('/auth/register', data).pipe(
      tap({
        next: (response) => {
          this.setUser(response.user, response.token);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false),
      }),
    );
  }

  /**
   * Get the current auth token
   */
  getAuthToken(): string | null {
    return this.api.getAuthToken();
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<LoginResponse> {
    this._isLoading.set(true);
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap({
        next: (response) => {
          this.setUser(response.user, response.token);
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false),
      }),
    );
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

  /**
   * Update user password
   */
  /**
   * Update user password
   */
  updatePassword(data: UpdatePasswordRequest): Observable<UpdatePasswordResponse> {
    const userId = this.getStoredUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    this._isLoading.set(true);
    return this.api.put<UpdatePasswordResponse>(`/users/${userId}/password`, data).pipe(
      tap({
        next: () => {
          this._isLoading.set(false);
        },
        error: () => this._isLoading.set(false),
      }),
    );
  }

  /**
   * Load current user details
   */
  loadCurrentUser(): Observable<User> {
    const userId = this.getStoredUserId();
    if (!userId) {
      throw new Error('User ID not found in storage');
    }
    return this.loadUser(userId);
  }
}
