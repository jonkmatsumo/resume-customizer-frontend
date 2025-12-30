import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/${environment.apiVersion}`;
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
    });

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('authToken');
    vi.unstubAllGlobals();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Management', () => {
    it('should store token', () => {
      service.setAuthToken('test-token');
      expect(localStorage.getItem('authToken')).toBe('test-token');
      expect(service.getAuthToken()).toBe('test-token');
    });

    it('should clear token', () => {
      service.setAuthToken('test-token');
      service.clearAuthToken();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(service.getAuthToken()).toBeNull();
    });

    it('should include Authorization header when token exists', () => {
      service.setAuthToken('test-token');
      const mockData = { id: '1' };

      service.get('/test').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/test`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(mockData);
    });
  });

  it('should make GET request', () => {
    const mockData = { id: '1', name: 'Test' };

    service.get('/test').subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/test`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(mockData);
  });

  it('should make POST request', () => {
    const mockData = { name: 'Test' };
    const responseData = { id: '1', name: 'Test' };

    service.post('/test', mockData).subscribe((data) => {
      expect(data).toEqual(responseData);
    });

    const req = httpMock.expectOne(`${baseUrl}/test`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(responseData);
  });

  it('should make PUT request', () => {
    const mockData = { id: '1', name: 'Updated' };

    service.put('/test/1', mockData).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockData);
  });

  it('should make PATCH request', () => {
    const mockData = { name: 'Updated' };

    service.patch('/test/1', mockData).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockData);
  });

  it('should make DELETE request', () => {
    const mockResponse = { success: true };

    service.delete('/test/1').subscribe((data) => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/test/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
