import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// URL polyfill for test environment (Attempt 8: Node.js native url module)
// See docs/CICD_FAILURES_RESOLUTION_PLAN.md for details
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { URL, URLSearchParams } = require('url');

describe('ErrorService', () => {
  let service: ErrorService;
  let snackBar: MatSnackBar;

  beforeAll(() => {
    // Ensure polyfill is applied before any tests
    vi.stubGlobal('URL', URL);
    vi.stubGlobal('URLSearchParams', URLSearchParams);
  });

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
