import { TestBed } from '@angular/core/testing';
import { RunsService } from './runs.service';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';
import { Run } from '../models';

describe('RunsService', () => {
  let service: RunsService;
  let apiServiceSpy: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  const mockRuns: Run[] = [
    {
      id: 'r1',
      user_id: 'u1',
      status: 'completed',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
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
      providers: [RunsService, { provide: ApiService, useValue: apiServiceSpy }],
    });
    service = TestBed.inject(RunsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have runs as empty array initially', () => {
    expect(service.runs()).toEqual([]);
  });

  it('should have isLoading as false initially', () => {
    expect(service.isLoading()).toBe(false);
  });

  describe('loadRuns', () => {
    it('should load runs and update signal (no filters)', () => {
      apiServiceSpy.get.mockReturnValue(of({ runs: mockRuns, count: 1 }));

      service.loadRuns().subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith('/runs');
      expect(service.runs()).toEqual(mockRuns);
      expect(service.isLoading()).toBe(false);
    });

    it('should load runs with filters', () => {
      apiServiceSpy.get.mockReturnValue(of({ runs: mockRuns, count: 1 }));

      service.loadRuns({ status: 'completed', company: 'Google' }).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith(expect.stringContaining('status=completed'));
      expect(apiServiceSpy.get).toHaveBeenCalledWith(expect.stringContaining('company=Google'));
    });

    it('should load runs with empty filters object', () => {
      apiServiceSpy.get.mockReturnValue(of({ runs: mockRuns, count: 1 }));
      service.loadRuns({}).subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith(expect.not.stringContaining('?'));
    });

    it('should load runs with status filter only', () => {
      apiServiceSpy.get.mockReturnValue(of({ runs: mockRuns, count: 1 }));
      service.loadRuns({ status: 'failed' }).subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith(expect.stringContaining('status=failed'));
      expect(apiServiceSpy.get).not.toHaveBeenCalledWith(expect.stringContaining('company'));
    });

    it('should load runs with company filter only', () => {
      apiServiceSpy.get.mockReturnValue(of({ runs: mockRuns, count: 1 }));
      service.loadRuns({ company: 'Meta' }).subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith(expect.stringContaining('company=Meta'));
      expect(apiServiceSpy.get).not.toHaveBeenCalledWith(expect.stringContaining('status'));
    });
  });

  describe('deleteRun', () => {
    it('should delete run and update signal', () => {
      apiServiceSpy.delete.mockReturnValue(of(void 0));
      apiServiceSpy.get.mockReturnValue(of({ runs: mockRuns, count: 1 }));
      service.loadRuns().subscribe(); // Load initial data

      service.deleteRun('r1').subscribe();

      expect(apiServiceSpy.delete).toHaveBeenCalledWith('/runs/r1');
      expect(service.runs().length).toBe(0);
    });
  });

  describe('Other Methods', () => {
    it('should get run status', () => {
      apiServiceSpy.get.mockReturnValue(of({}));
      service.getRunStatus('r1').subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/status/r1');
    });

    it('should get artifacts', () => {
      apiServiceSpy.get.mockReturnValue(of([]));
      service.getArtifacts('r1').subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/runs/r1/artifacts');
    });

    it('should get artifact', () => {
      apiServiceSpy.get.mockReturnValue(of({}));
      service.getArtifact('a1').subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/artifact/a1');
    });

    it('should download resume', () => {
      apiServiceSpy.get.mockReturnValue(of(new Blob()));
      service.downloadResume('r1').subscribe();
      expect(apiServiceSpy.get).toHaveBeenCalledWith('/runs/r1/resume.tex');
    });
  });
});
