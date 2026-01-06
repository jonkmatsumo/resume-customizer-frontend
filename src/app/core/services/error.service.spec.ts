import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// URL polyfill for test environment (Attempt 9a: Direct global assignment at module load time)
// See docs/CICD_FAILURES_RESOLUTION_PLAN.md for details
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { URL, URLSearchParams } = require('url');

// Apply polyfill immediately at module load time (before any code executes)
if (typeof global !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Polyfill requires modifying global object
  (global as any).URL = URL;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Polyfill requires modifying global object
  (global as any).URLSearchParams = URLSearchParams;
}
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Polyfill requires modifying global object
  (window as any).URL = URL;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Polyfill requires modifying global object
  (window as any).URLSearchParams = URLSearchParams;
}

describe('ErrorService', () => {
  let service: ErrorService;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorService,
        {
          provide: MatSnackBar,
          useValue: {
            open: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(ErrorService);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show error snackbar', () => {
    service.showError('Test Error');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Test Error',
      'Close',
      expect.objectContaining({ panelClass: ['error-snackbar'] }),
    );
  });

  it('should show success snackbar', () => {
    service.showSuccess('Test Success');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Test Success',
      'Close',
      expect.objectContaining({ panelClass: ['success-snackbar'] }),
    );
  });
});
