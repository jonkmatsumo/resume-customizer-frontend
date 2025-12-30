import { TestBed } from '@angular/core/testing';
import { JobsService } from './jobs.service';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';
import {
  Job,
  CreateJobRequest,
  UpdateJobRequest,
  CreateExperienceRequest,
  UpdateExperienceRequest,
} from '../models';

describe('JobsService', () => {
  let service: JobsService;
  let apiServiceSpy: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockJobs: Job[] = [
    {
      id: '1',
      user_id: 'u1',
      company: 'Company A',
      role_title: 'Engineer',
      location: 'Remote',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
    },
    {
      id: '2',
      user_id: 'u1',
      company: 'Company B',
      role_title: 'Manager',
      location: 'Remote',
      created_at: '2023-01-02',
      updated_at: '2023-01-02',
    },
  ];

  beforeEach(() => {
    apiServiceSpy = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [JobsService, { provide: ApiService, useValue: apiServiceSpy }],
    });
    service = TestBed.inject(JobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have jobs as empty array initially', () => {
    expect(service.jobs()).toEqual([]);
  });

  it('should have isLoading as false initially', () => {
    expect(service.isLoading()).toBe(false);
  });

  describe('loadJobs', () => {
    it('should load jobs and update signal', () => {
      apiServiceSpy.get.mockReturnValue(of(mockJobs));

      service.loadJobs('u1').subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith('/users/u1/jobs');
      expect(service.jobs()).toEqual(mockJobs);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('createJob', () => {
    it('should create job and update signal', () => {
      const newJob = { ...mockJobs[0], id: '3', company: 'New Co' };
      apiServiceSpy.post.mockReturnValue(of(newJob));

      // Initial state
      apiServiceSpy.get.mockReturnValue(of(mockJobs));
      service.loadJobs('u1').subscribe();

      const createReq: CreateJobRequest = {
        company: 'New Co',
        role_title: 'Engineer',
      };
      service.createJob('u1', createReq).subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalled();
      expect(service.jobs().length).toBe(3);
      expect(service.jobs()[2]).toEqual(newJob);
    });
  });

  describe('updateJob', () => {
    it('should update correct job in signal and leave others unchanged', () => {
      const updatedJob = { ...mockJobs[0], company: 'Updated Co' };
      apiServiceSpy.put.mockReturnValue(of(updatedJob));

      // Initial state with 2 jobs
      apiServiceSpy.get.mockReturnValue(of(mockJobs));
      service.loadJobs('u1').subscribe();

      const updateReq: UpdateJobRequest = { company: 'Updated Co' };
      service.updateJob('1', updateReq).subscribe();

      expect(apiServiceSpy.put).toHaveBeenCalledWith(
        '/jobs/1',
        expect.objectContaining({ company: 'Updated Co' }),
      );

      const jobs = service.jobs();
      expect(jobs.length).toBe(2);
      expect(jobs[0].company).toBe('Updated Co'); // Updated
      expect(jobs[1].company).toBe('Company B'); // Unchanged
    });
  });

  describe('deleteJob', () => {
    it('should delete job and update signal', () => {
      apiServiceSpy.delete.mockReturnValue(of(void 0));
      apiServiceSpy.get.mockReturnValue(of(mockJobs));
      service.loadJobs('u1').subscribe();

      service.deleteJob('1').subscribe();

      expect(apiServiceSpy.delete).toHaveBeenCalledWith('/jobs/1');
      expect(service.jobs().length).toBe(1);
      expect(service.jobs()[0].id).toBe('2');
    });
  });

  describe('Experience Methods', () => {
    it('should load experiences', () => {
      apiServiceSpy.get.mockReturnValue(of([]));
      service.loadExperiences('1').subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/jobs/1/experiences');
    });

    it('should create experience', () => {
      apiServiceSpy.post.mockReturnValue(of({}));
      const req: CreateExperienceRequest = {} as unknown as CreateExperienceRequest;
      service.createExperience('1', req).subscribe();
      expect(apiServiceSpy.post).toHaveBeenCalledWith('/jobs/1/experiences', expect.any(Object));
    });

    it('should update experience', () => {
      apiServiceSpy.put.mockReturnValue(of({}));
      const req: UpdateExperienceRequest = {} as unknown as UpdateExperienceRequest;
      service.updateExperience('exp1', req).subscribe();
      expect(apiServiceSpy.put).toHaveBeenCalledWith('/experiences/exp1', expect.any(Object));
    });

    it('should delete experience', () => {
      apiServiceSpy.delete.mockReturnValue(of(void 0));
      service.deleteExperience('exp1').subscribe();
      expect(apiServiceSpy.delete).toHaveBeenCalledWith('/experiences/exp1');
    });
  });
});
