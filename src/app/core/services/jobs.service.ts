import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../services/api.service';
import {
  Job,
  Experience,
  CreateJobRequest,
  UpdateJobRequest,
  CreateExperienceRequest,
  UpdateExperienceRequest,
} from '../models';
import { Observable, tap } from 'rxjs';

/**
 * Service to manage jobs and experiences state.
 * Uses Angular signals for reactive state management.
 */
@Injectable({
  providedIn: 'root',
})
export class JobsService {
  private readonly api = inject(ApiService);

  // Signals for reactive state
  private readonly _jobs = signal<Job[]>([]);
  private readonly _isLoading = signal(false);

  // Public readonly computed signals
  readonly jobs = computed(() => this._jobs());
  readonly isLoading = computed(() => this._isLoading());

  /**
   * Load all jobs for a user
   */
  loadJobs(userId: string): Observable<Job[]> {
    this._isLoading.set(true);
    return this.api.get<Job[]>(`/users/${userId}/jobs`).pipe(
      tap((jobs) => {
        this._jobs.set(jobs);
        this._isLoading.set(false);
      }),
    );
  }

  /**
   * Create a new job
   */
  createJob(userId: string, job: CreateJobRequest): Observable<Job> {
    return this.api.post<Job>(`/users/${userId}/jobs`, job).pipe(
      tap((newJob) => {
        this._jobs.update((jobs) => [...jobs, newJob]);
      }),
    );
  }

  /**
   * Update an existing job
   */
  updateJob(jobId: string, updates: UpdateJobRequest): Observable<Job> {
    return this.api.put<Job>(`/jobs/${jobId}`, updates).pipe(
      tap((updatedJob) => {
        this._jobs.update((jobs) => jobs.map((job) => (job.id === jobId ? updatedJob : job)));
      }),
    );
  }

  /**
   * Delete a job
   */
  deleteJob(jobId: string): Observable<void> {
    return this.api.delete<void>(`/jobs/${jobId}`).pipe(
      tap(() => {
        this._jobs.update((jobs) => jobs.filter((job) => job.id !== jobId));
      }),
    );
  }

  /**
   * Load experiences for a job
   */
  loadExperiences(jobId: string): Observable<Experience[]> {
    return this.api.get<Experience[]>(`/jobs/${jobId}/experiences`);
  }

  /**
   * Create a new experience bullet
   */
  createExperience(jobId: string, experience: CreateExperienceRequest): Observable<Experience> {
    return this.api.post<Experience>(`/jobs/${jobId}/experiences`, experience);
  }

  /**
   * Update an existing experience
   */
  updateExperience(experienceId: string, updates: UpdateExperienceRequest): Observable<Experience> {
    return this.api.put<Experience>(`/experiences/${experienceId}`, updates);
  }

  /**
   * Delete an experience
   */
  deleteExperience(experienceId: string): Observable<void> {
    return this.api.delete<void>(`/experiences/${experienceId}`);
  }
}
