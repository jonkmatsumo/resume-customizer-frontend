import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { ApiService } from '../../../../services/api.service';
import { UserService } from '../../../../core/services/user.service';
import { ErrorService } from '../../../../core/services/error.service';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { signal, WritableSignal } from '@angular/core';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let apiServiceSpy: { get: ReturnType<typeof vi.fn> };
  let userServiceSpy: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    loadCurrentUser: ReturnType<typeof vi.fn>;
    getStoredUserId: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    updatePassword: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    isLoading: WritableSignal<boolean>;
  };
  let errorServiceSpy: {
    showSuccess: ReturnType<typeof vi.fn>;
    showError: ReturnType<typeof vi.fn>;
  };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiServiceSpy = {
      get: vi.fn(),
    };
    userServiceSpy = {
      isAuthenticated: vi.fn(),
      loadCurrentUser: vi.fn(),
      getStoredUserId: vi.fn(),
      updateUser: vi.fn(),
      updatePassword: vi.fn(),
      logout: vi.fn(),
      isLoading: signal(false),
    };
    errorServiceSpy = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
    };
    routerSpy = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, NoopAnimationsModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: ErrorService, useValue: errorServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Profile Management', () => {
    it('should load profile on init if authenticated', () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      userServiceSpy.isAuthenticated.mockReturnValue(true);
      userServiceSpy.loadCurrentUser.mockReturnValue(of(mockUser));

      fixture.detectChanges(); // triggers ngOnInit

      expect(component.originalUser).toEqual(mockUser);
      expect(component.profileForm?.value).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        phone: '',
      });
    });

    it('should set error if not authenticated', () => {
      userServiceSpy.isAuthenticated.mockReturnValue(false);
      fixture.detectChanges();
      expect(component.errorMessage()).toContain('Not authenticated');
    });

    it('should update profile successfully', () => {
      const mockUser = { id: '1', name: 'Original', email: 'test@example.com' };
      userServiceSpy.isAuthenticated.mockReturnValue(true);
      userServiceSpy.loadCurrentUser.mockReturnValue(of(mockUser));
      userServiceSpy.updateUser.mockReturnValue(of(mockUser));

      fixture.detectChanges();

      component.enableEditingProfile();
      component.profileForm?.patchValue({ name: 'Updated Name' });
      component.onSaveProfile();

      expect(userServiceSpy.updateUser).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ name: 'Updated Name' }),
      );
      expect(errorServiceSpy.showSuccess).toHaveBeenCalled();
      expect(component.isEditingProfile()).toBe(false);
    });
  });

  describe('Password Management', () => {
    it('should validate password match', () => {
      component.enableChangePassword();
      const form = component.passwordForm!;

      form.patchValue({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmNewPassword: 'mismatch',
      });

      expect(form.errors).toEqual({ passwordMismatch: true });
      expect(form.get('confirmNewPassword')?.errors).toEqual({ passwordMismatch: true });

      form.patchValue({ confirmNewPassword: 'newpass123' });
      expect(form.errors).toBeNull();
    });
  });

  describe('Data Export', () => {
    it('should export data when logged in', () => {
      userServiceSpy.getStoredUserId.mockReturnValue('1');
      apiServiceSpy.get.mockReturnValue(of([{ id: 'job1' }]));

      // Mock window URL methods
      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: vi.fn(() => 'blob:url'),
          revokeObjectURL: vi.fn(),
        },
        writable: true,
      });

      component.exportExperienceBank();

      expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/1/jobs');
      expect(errorServiceSpy.showSuccess).toHaveBeenCalled();
    });
  });
});
