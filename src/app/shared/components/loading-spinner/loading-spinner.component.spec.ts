import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// URL polyfill for test environment (Attempt 8: Node.js native url module)
// See docs/CICD_FAILURES_RESOLUTION_PLAN.md for details
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { URL, URLSearchParams } = require('url');

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeAll(() => {
    // Ensure polyfill is applied before any tests
    vi.stubGlobal('URL', URL);
    vi.stubGlobal('URLSearchParams', URLSearchParams);
  });

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
