import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
