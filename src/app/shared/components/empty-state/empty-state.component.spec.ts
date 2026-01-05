import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { By } from '@angular/platform-browser';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    // URL polyfill for test environment using vi.stubGlobal
    // See docs/CICD_FAILURES_RESOLUTION_PLAN.md for details
    const { URL, URLSearchParams } = await import('whatwg-url');
    vi.stubGlobal('URL', URL);
    vi.stubGlobal('URLSearchParams', URLSearchParams);
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
