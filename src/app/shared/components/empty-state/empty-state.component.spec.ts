import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { By } from '@angular/platform-browser';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

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
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title and message', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('message', 'Test Message');
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.querySelector('h2').textContent).toContain('Test Title');
    expect(element.querySelector('p').textContent).toContain('Test Message');
  });

  it('should emit action event when button clicked', () => {
    fixture.componentRef.setInput('actionLabel', 'Do Action');
    fixture.detectChanges();

    const spy = vi.spyOn(component.action, 'emit');
    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();

    expect(spy).toHaveBeenCalled();
  });
});
