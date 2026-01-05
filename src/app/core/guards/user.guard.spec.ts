import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { userGuard } from './user.guard';
import { UserService } from '../services/user.service';
import { User } from '../models';

describe('userGuard', () => {
  let userService: UserService;
  let router: Router;
  let localStorageMock: Record<string, string>;

  const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    // URL polyfill for test environment
    // See docs/CICD_FAILURES_RESOLUTION_PLAN.md for details
    if (typeof global !== 'undefined' && !global.URL) {
      const { URL, URLSearchParams } = await import('whatwg-url');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).URL = URL;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).URLSearchParams = URLSearchParams;
    }
    if (typeof window !== 'undefined' && !window.URL) {
      const { URL, URLSearchParams } = await import('whatwg-url');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).URL = URL;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).URLSearchParams = URLSearchParams;
    }
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

    TestBed.configureTestingModule({
      providers: [
        UserService,
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn().mockReturnValue({ toString: () => '/login' } as UrlTree),
          },
        },
      ],
    });

    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should allow access when user is logged in', () => {
    userService.setUser(mockUser, 'test-token');

    const result = TestBed.runInInjectionContext(() => userGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('should redirect to /login when no user', () => {
    userService.logout();

    const result = TestBed.runInInjectionContext(() => userGuard({} as never, {} as never));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).not.toBe(true);
  });
});
