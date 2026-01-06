import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { UserService } from '../../../../core/services/user.service';
import { Router, provideRouter } from '@angular/router';

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

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let userServiceSpy: {
    isAuthenticated: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    userServiceSpy = {
      isAuthenticated: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to dashboard if authenticated on init', () => {
    userServiceSpy.isAuthenticated.mockReturnValue(true);
    // triggering ngOnInit manually or via detectChanges on a fresh component
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/resumes']);
  });

  it('should show Get Started and Login buttons when not authenticated', () => {
    userServiceSpy.isAuthenticated.mockReturnValue(false);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Get Started');
    expect(element.textContent).toContain('I already have an account');
  });

  it('should navigate to register', () => {
    userServiceSpy.isAuthenticated.mockReturnValue(false);
    fixture.detectChanges();

    component.navigateToRegister();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should navigate to login', () => {
    userServiceSpy.isAuthenticated.mockReturnValue(false);
    fixture.detectChanges();

    component.navigateToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
