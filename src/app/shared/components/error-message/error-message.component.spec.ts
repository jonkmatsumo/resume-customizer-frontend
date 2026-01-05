import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';
import { By } from '@angular/platform-browser';

describe('ErrorMessageComponent', () => {
  let component: ErrorMessageComponent;
  let fixture: ComponentFixture<ErrorMessageComponent>;

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
      imports: [ErrorMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
    // Do NOT detect changes here if we want to set inputs first to avoid NG0100 in initial render if inputs drive structural directives
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should emit retry event when retry button clicked', () => {
    // Set inputs using componentRef.setInput for modern Angular compatibility
    fixture.componentRef.setInput('message', 'Error');
    fixture.componentRef.setInput('showRetry', true);
    fixture.detectChanges();

    const spy = vi.spyOn(component.retry, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(spy).toHaveBeenCalled();
  });
});
