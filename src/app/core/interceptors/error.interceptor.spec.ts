import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let snackBar: MatSnackBar;
  let userService: UserService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        {
          provide: MatSnackBar,
          useValue: {
            open: vi.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            logout: vi.fn(),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    snackBar = TestBed.inject(MatSnackBar);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should intercept error and show snackbar', () => {
    httpClient.get('/test').subscribe({
      next: () => {
        throw new Error('should have failed with error');
      },
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith(
          expect.stringContaining('Server error'),
          'Close',
          expect.any(Object),
        );
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle client side error', () => {
    const errorEvent = new ErrorEvent('Network error', {
      message: 'Net error',
    });

    httpClient.get('/test').subscribe({
      next: () => {
        throw new Error('should have failed with error');
      },
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith('Error: Net error', 'Close', expect.any(Object));
      },
    });

    const req = httpMock.expectOne('/test');
    req.error(errorEvent);
  });

  it('should handle 400 Bad Request', () => {
    httpClient.get('/test').subscribe({
      next: () => {
        throw new Error('should have failed');
      },
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith('Bad request', 'Close', expect.any(Object));
      },
    });
    httpMock.expectOne('/test').flush(null, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle 401 Unauthorized', () => {
    httpClient.get('/test').subscribe({
      next: () => {
        throw new Error('should have failed');
      },
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith(
          'Unauthorized. Please log in.',
          'Close',
          expect.any(Object),
        );
      },
    });
    httpMock.expectOne('/test').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(userService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle 403 Forbidden', () => {
    httpClient.get('/test').subscribe({
      next: () => {
        throw new Error('should have failed');
      },
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith(
          'Forbidden. You do not have permission.',
          'Close',
          expect.any(Object),
        );
      },
    });
    httpMock.expectOne('/test').flush(null, { status: 403, statusText: 'Forbidden' });
    expect(userService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle 404 Not Found', () => {
    httpClient.get('/test').subscribe({
      next: () => {
        throw new Error('should have failed');
      },
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith(
          'Resource not found',
          'Close',
          expect.any(Object),
        );
      },
    });
    httpMock.expectOne('/test').flush(null, { status: 404, statusText: 'Not Found' });
  });

  it('should handle 409 Conflict', () => {
    httpClient.get('/test').subscribe({
      next: () => {
        throw new Error('should have failed');
      },
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith(
          'Conflict. Resource already exists.',
          'Close',
          expect.any(Object),
        );
      },
    });
    httpMock.expectOne('/test').flush(null, { status: 409, statusText: 'Conflict' });
  });

  it('should handle default error case (unknown status)', () => {
    httpClient.get('/test').subscribe({
      next: () => {
        throw new Error('should have failed');
      },
      error: () => {
        expect(snackBar.open).toHaveBeenCalledWith('Error: 503', 'Close', expect.any(Object));
      },
    });
    httpMock.expectOne('/test').flush(null, { status: 503, statusText: 'Service Unavailable' });
  });
});
