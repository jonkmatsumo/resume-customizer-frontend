import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
