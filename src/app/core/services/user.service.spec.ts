import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { User } from '../models';

describe('UserService', () => {
  let service: UserService;
  let localStorageMock: Record<string, string>;

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

    TestBed.configureTestingModule({});
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
});
