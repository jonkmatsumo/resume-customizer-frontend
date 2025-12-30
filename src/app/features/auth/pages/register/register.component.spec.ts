import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { Router, provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError, Observable } from 'rxjs';
import { User } from '../../../../core/models';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceSpy: { setUser: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  let errorServiceSpy: { showSuccess: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    userServiceSpy = {
      setUser: vi.fn(),
      register: vi.fn(),
    };
    errorServiceSpy = {
      showSuccess: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, BrowserAnimationsModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        provideRouter([]),
        // ApiService is not needed strictly if the component doesn't inject it directly anymore,
        // but if it's a dependency of UserService (even though we mock UserService), we might leave it or remove it.
        // Since we mock UserService, we don't need ApiService in providers unless the component uses it.
        // The component was refactored to remove ApiService.
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should require password matching', () => {
    component.registerForm.patchValue({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'mismatch',
    });
    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
    expect(
      component.registerForm.get('confirmPassword')?.hasError('passwordMismatch'),
    ).toBeTruthy();
  });

  it('should be valid when passwords match', () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '',
    });
    expect(component.registerForm.valid).toBeTruthy();
    expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
  });

  it('should call register on submit', () => {
    const userData = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '',
    };
    component.registerForm.setValue(userData);
    const mockResponse = {
      user: { id: '1', name: 'Test', email: 'test@example.com' } as User,
      token: 'token',
    };
    userServiceSpy.register.mockReturnValue(of(mockResponse));

    component.onSubmit();

    expect(userServiceSpy.register).toHaveBeenCalledWith({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: undefined,
    });
    // The component no longer calls setUser, the service does.
    // expect(userServiceSpy.setUser).toHaveBeenCalledWith(mockUser);
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should show loading state during registration', () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '',
    });
    userServiceSpy.register.mockReturnValue(new Observable()); // Never emits

    component.onSubmit();

    expect(component.isLoading()).toBe(true);
  });

  it('should handle registration error', () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '',
    });
    userServiceSpy.register.mockReturnValue(throwError(() => new Error('Registration failed')));

    component.onSubmit();

    expect(component.isLoading()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
  });

  it('should toggle confirm password visibility', () => {
    expect(component.hideConfirmPassword()).toBe(true);
    component.toggleConfirmPasswordVisibility();
    expect(component.hideConfirmPassword()).toBe(false);
  });
});
