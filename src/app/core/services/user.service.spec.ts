import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { User } from '../models';
import { ApiService } from '../../services/api.service';
import { of, throwError } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let localStorageMock: Record<string, string>;
  let apiServiceSpy: {
    get: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    setAuthToken: ReturnType<typeof vi.fn>;
    clearAuthToken: ReturnType<typeof vi.fn>;
    getAuthToken: ReturnType<typeof vi.fn>;
  };

  const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
    });

    apiServiceSpy = {
      get: vi.fn(),
      put: vi.fn(),
      post: vi.fn(),
      setAuthToken: vi.fn(),
      clearAuthToken: vi.fn(),
      getAuthToken: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [UserService, { provide: ApiService, useValue: apiServiceSpy }],
    });
    service = TestBed.inject(UserService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have null currentUser initially', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('should have isLoggedIn as false initially', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should have isLoading as false initially', () => {
    expect(service.isLoading()).toBe(false);
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      apiServiceSpy.getAuthToken.mockReturnValue(null);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token exists', () => {
      apiServiceSpy.getAuthToken.mockReturnValue('valid-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set the current user', () => {
      service.setUser(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
    });

    it('should set isLoggedIn to true when user is set', () => {
      service.setUser(mockUser);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should store userId in localStorage', () => {
      service.setUser(mockUser);
      expect(localStorage.getItem('userId')).toBe('user-123');
    });

    it('should set auth token if provided', () => {
      service.setUser(mockUser, 'new-token');
      expect(apiServiceSpy.setAuthToken).toHaveBeenCalledWith('new-token');
    });

    it('should remove userId from localStorage when set to null', () => {
      service.setUser(mockUser);
      service.setUser(null);
      expect(localStorage.getItem('userId')).toBeNull();
    });
  });

  describe('getStoredUserId', () => {
    it('should return null when no userId stored', () => {
      expect(service.getStoredUserId()).toBeNull();
    });

    it('should return stored userId', () => {
      localStorage.setItem('userId', 'test-user-id');
      expect(service.getStoredUserId()).toBe('test-user-id');
    });
  });

  describe('logout', () => {
    it('should clear current user', () => {
      service.setUser(mockUser);
      service.logout();
      expect(service.currentUser()).toBeNull();
    });

    it('should set isLoggedIn to false', () => {
      service.setUser(mockUser);
      service.logout();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should remove userId from localStorage', () => {
      service.setUser(mockUser);
      service.logout();
      expect(localStorage.getItem('userId')).toBeNull();
    });

    it('should clear auth token', () => {
      service.logout();
      expect(apiServiceSpy.clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('loadUser', () => {
    it('should load user and update signal', () => {
      apiServiceSpy.get.mockReturnValue(of(mockUser));

      service.loadUser('user-123').subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/user-123');
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle loading state correctly', () => {
      apiServiceSpy.get.mockReturnValue(of(mockUser));

      const sub = service.loadUser('user-123');
      // synchronous observable in tests, so isLoading flips true->false immediately
      // to test true, we'd need a delay, but verifying final state is enough for now
      // or we can test that it was called.

      sub.subscribe();
      expect(service.isLoading()).toBe(false);
    });

    it('should handle error', () => {
      apiServiceSpy.get.mockReturnValue(throwError(() => new Error('Error')));

      service.loadUser('user-123').subscribe({
        error: () => {
          /* intentional empty */
        },
      });

      expect(service.isLoading()).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('should update user and update signal', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      apiServiceSpy.put.mockReturnValue(of(updatedUser));

      service.updateUser('user-123', { name: 'Updated Name' }).subscribe();

      expect(apiServiceSpy.put).toHaveBeenCalledWith('/users/user-123', { name: 'Updated Name' });
      expect(service.currentUser()).toEqual(updatedUser);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle error', () => {
      apiServiceSpy.put.mockReturnValue(throwError(() => new Error('Error')));

      service.updateUser('user-123', {}).subscribe({
        error: () => {
          /* intentional empty */
        },
      });

      expect(service.isLoading()).toBe(false);
    });
  });

  describe('login', () => {
    it('should login and set user and token', () => {
      const loginResponse = { user: mockUser, token: 'test-token' };
      apiServiceSpy.post.mockReturnValue(of(loginResponse));

      service.login('test@example.com', 'password').subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(service.currentUser()).toEqual(mockUser);
      expect(apiServiceSpy.setAuthToken).toHaveBeenCalledWith('test-token');
      expect(service.isLoading()).toBe(false);
    });

    it('should handle login error', () => {
      apiServiceSpy.post.mockReturnValue(throwError(() => new Error('Login failed')));

      service.login('test@example.com', 'badpass').subscribe({
        error: () => {
          /* intentional empty */
        },
      });

      expect(service.isLoading()).toBe(false);
      expect(service.currentUser()).toBeNull();
    });
  });
});
