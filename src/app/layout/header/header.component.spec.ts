import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { UserService } from '../../core/services/user.service';
import { Router, provideRouter } from '@angular/router';
import { User } from '../../core/models';

// URL polyfill for test environment (Approach 7g: top-level require + beforeAll)
// See docs/CICD_FAILURES_RESOLUTION_PLAN.md for details
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { URL, URLSearchParams } = require('whatwg-url');

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let userServiceSpy: {
    currentUser: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    isLoggedIn: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeAll(() => {
    // Ensure polyfill is applied before any tests
    vi.stubGlobal('URL', URL);
    vi.stubGlobal('URLSearchParams', URLSearchParams);
  });

  beforeEach(async () => {
    userServiceSpy = {
      currentUser: vi.fn(),
      isAuthenticated: vi.fn(),
      logout: vi.fn(),
      isLoggedIn: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show login/register links when not authenticated', () => {
    userServiceSpy.isAuthenticated.mockReturnValue(false);
    userServiceSpy.currentUser.mockReturnValue(null);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Login');
    expect(element.textContent).toContain('Register');
    expect(element.textContent).not.toContain('Logout');
    expect(element.textContent).not.toContain('Profile');
  });

  it('should show user info and logout button when authenticated', () => {
    userServiceSpy.isAuthenticated.mockReturnValue(true);
    userServiceSpy.currentUser.mockReturnValue({ email: 'test@example.com' } as User);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('test@example.com');
    expect(element.textContent).toContain('Logout');
    expect(element.textContent).not.toContain('Login');
    expect(element.textContent).toContain('Settings');
  });

  it('should call logout and navigate on logout click', () => {
    userServiceSpy.isAuthenticated.mockReturnValue(true);
    userServiceSpy.currentUser.mockReturnValue({ email: 'test@example.com' } as User);
    fixture.detectChanges();

    const logoutButton = (fixture.nativeElement as HTMLElement).querySelector('button');
    logoutButton?.click();

    expect(userServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
