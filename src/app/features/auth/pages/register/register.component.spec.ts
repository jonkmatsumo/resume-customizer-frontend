import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { UserService } from '../../../../core/services/user.service';
import { ApiService } from '../../../../services/api.service';
import { ErrorService } from '../../../../core/services/error.service';
import { Router, provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { User } from '../../../../core/models';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userServiceSpy: { setUser: ReturnType<typeof vi.fn> };
  let apiServiceSpy: { post: ReturnType<typeof vi.fn> };
  let errorServiceSpy: { showSuccess: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    userServiceSpy = {
      setUser: vi.fn(),
    };
    apiServiceSpy = {
      post: vi.fn(),
    };
    errorServiceSpy = {
      showSuccess: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, BrowserAnimationsModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        provideRouter([]),
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

  it('should call api on submit', () => {
    const userData = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '',
    };
    component.registerForm.setValue(userData);
    const mockUser = { id: '1', name: 'Test', email: 'test@example.com' } as User;
    apiServiceSpy.post.mockReturnValue(of(mockUser));

    component.onSubmit();

    expect(apiServiceSpy.post).toHaveBeenCalledWith('/users', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: undefined,
    });
    expect(userServiceSpy.setUser).toHaveBeenCalledWith(mockUser);
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should handle registration error', () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '',
    });
    apiServiceSpy.post.mockReturnValue(throwError(() => new Error('Registration failed')));

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
