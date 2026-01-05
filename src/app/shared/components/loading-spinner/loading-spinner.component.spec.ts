import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

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
