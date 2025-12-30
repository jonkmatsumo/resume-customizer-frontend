import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { Router, provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userServiceSpy: { login: ReturnType<typeof vi.fn> };
  let errorServiceSpy: { showSuccess: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    userServiceSpy = {
      login: vi.fn(),
    };
    errorServiceSpy = {
      showSuccess: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, BrowserAnimationsModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTruthy();
  });

  it('should be valid when form is filled correctly', () => {
    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('password123');
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call login service on submit', () => {
    const email = 'test@example.com';
    const password = 'password123';
    component.loginForm.setValue({ email, password });
    userServiceSpy.login.mockReturnValue(of({ user: { id: '1', name: 'Test' }, token: 'token' }));

    component.onSubmit();

    expect(userServiceSpy.login).toHaveBeenCalledWith(email, password);
  });

  it('should navigate on successful login', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });
    userServiceSpy.login.mockReturnValue(of({ user: { id: '1', name: 'Test' }, token: 'token' }));

    component.onSubmit();

    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
    expect(errorServiceSpy.showSuccess).toHaveBeenCalled();
  });

  it('should handle login error', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });
    userServiceSpy.login.mockReturnValue(throwError(() => new Error('Login failed')));

    component.onSubmit();

    expect(component.isLoading()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
  });
});
