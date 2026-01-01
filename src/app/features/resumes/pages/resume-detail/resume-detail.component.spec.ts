import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumeDetailComponent } from './resume-detail.component';
import { RunsService } from '../../../../core/services/runs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('ResumeDetailComponent', () => {
  let component: ResumeDetailComponent;
  let fixture: ComponentFixture<ResumeDetailComponent>;
  let runsServiceMock: {
    getRunStatus: ReturnType<typeof vi.fn>;
    getRunSteps: ReturnType<typeof vi.fn>;
    getRunBasicInfo: ReturnType<typeof vi.fn>;
    getArtifacts: ReturnType<typeof vi.fn>;
    downloadResume: ReturnType<typeof vi.fn>;
  };
  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  const mockRunId = '123-abc';
  beforeEach(async () => {
    runsServiceMock = {
      getRunStatus: vi.fn(),
      getRunSteps: vi.fn(),
      getRunBasicInfo: vi.fn(),
      getArtifacts: vi.fn(),
      downloadResume: vi.fn(),
    };
    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ResumeDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: RunsService, useValue: runsServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => mockRunId,
              },
            },
          },
        },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumeDetailComponent);
    component = fixture.componentInstance;
  });

  it('should display error message when loading run steps fails', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Run not found' },
      status: 404,
      statusText: 'Not Found',
    });

    runsServiceMock.getRunSteps.mockReturnValue(throwError(() => errorResponse));
    runsServiceMock.getRunBasicInfo.mockReturnValue(of({})); // Should handle gracefully
    runsServiceMock.getArtifacts.mockReturnValue(of([]));

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.error()).toBe('Run not found');

    // Verify template rendering
    const nativeElement = fixture.nativeElement as HTMLElement;
    const errorCard = nativeElement.querySelector('.error-card');
    expect(errorCard).toBeTruthy();
    expect(nativeElement.textContent).toContain('Resume Not Found');
    expect(nativeElement.textContent).toContain('Run not found');
  });

  it('should display default error message when error has no message', () => {
    const errorResponse = new HttpErrorResponse({
      error: {}, // No message
      status: 500,
    });

    runsServiceMock.getRunSteps.mockReturnValue(throwError(() => errorResponse));
    runsServiceMock.getRunBasicInfo.mockReturnValue(of({}));
    runsServiceMock.getArtifacts.mockReturnValue(of([]));

    fixture.detectChanges();

    expect(component.error()).toContain('Failed to load run details');
  });

  it('should navigate back to dashboard when goBack is called', () => {
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/resumes']);
  });

  it('should display steps when loaded successfully', () => {
    const mockStepsResponse = {
      run_id: '123',
      status: 'completed',
      steps: [
        { step: 'step1', status: 'completed', duration_ms: 1000 },
        { step: 'step2', status: 'in_progress' },
      ],
      summary: { total: 2, completed: 1, failed: 0, in_progress: 1, pending: 0 },
    };

    runsServiceMock.getRunSteps.mockReturnValue(of(mockStepsResponse));
    runsServiceMock.getRunBasicInfo.mockReturnValue(of({ company: 'Test Corp', role: 'Dev' }));
    runsServiceMock.getArtifacts.mockReturnValue(of([]));

    fixture.detectChanges();

    const nativeElement = fixture.nativeElement as HTMLElement;
    expect(nativeElement.textContent).toContain('Test Corp');
    expect(nativeElement.textContent).toContain('Dev');
    expect(nativeElement.querySelectorAll('.step-item').length).toBe(2);
  });
});
