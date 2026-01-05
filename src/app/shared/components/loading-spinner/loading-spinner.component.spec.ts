import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    // URL polyfill for test environment using vi.stubGlobal
    // See docs/CICD_FAILURES_RESOLUTION_PLAN.md for details
    const { URL, URLSearchParams } = await import('whatwg-url');
    vi.stubGlobal('URL', URL);
    vi.stubGlobal('URLSearchParams', URLSearchParams);
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
