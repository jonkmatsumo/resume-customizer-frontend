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

  it('should display error message when loading run fails with 404', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Run not found' },
      status: 404,
      statusText: 'Not Found',
    });

    runsServiceMock.getRunStatus.mockReturnValue(throwError(() => errorResponse));
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

    runsServiceMock.getRunStatus.mockReturnValue(throwError(() => errorResponse));
    runsServiceMock.getArtifacts.mockReturnValue(of([]));

    fixture.detectChanges();

    expect(component.error()).toContain('Could not find the requested resume');
  });

  it('should navigate back to dashboard when goBack is called', () => {
    component.goBack();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/resumes']);
  });
});
