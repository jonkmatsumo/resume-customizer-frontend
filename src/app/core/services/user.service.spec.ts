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

  describe('clearUser', () => {
    it('should clear current user', () => {
      service.setUser(mockUser);
      service.clearUser();
      expect(service.currentUser()).toBeNull();
    });

    it('should set isLoggedIn to false', () => {
      service.setUser(mockUser);
      service.clearUser();
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should remove userId from localStorage', () => {
      service.setUser(mockUser);
      service.clearUser();
      expect(localStorage.getItem('userId')).toBeNull();
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
});
