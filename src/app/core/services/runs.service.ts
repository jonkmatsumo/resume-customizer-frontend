import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UserService } from './user.service';
import { Run, Artifact } from '../models';
import { Observable, tap, map } from 'rxjs';

/**
 * Service to manage resume generation runs state.
 * Uses Angular signals for reactive state management.
 */
@Injectable({
  providedIn: 'root',
})
export class RunsService {
  private readonly api = inject(ApiService);
  private readonly userService = inject(UserService);

  // Signals for reactive state
  private readonly _runs = signal<Run[]>([]);
  private readonly _isLoading = signal(false);

  // Public readonly computed signals
  readonly runs = computed(() => this._runs());
  readonly isLoading = computed(() => this._isLoading());

  /**
   * Load all runs (with optional filters)
   */
  loadRuns(filters?: { status?: string; company?: string }): Observable<Run[]> {
    this._isLoading.set(true);
    const userId = this.userService.getStoredUserId();

    if (!userId) {
      this._isLoading.set(false);
      return new Observable((subscriber) => {
        subscriber.error('User ID not found');
        subscriber.complete();
      });
    }

    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.company) params.append('company', filters.company);

    const query = params.toString();
    const endpoint = query ? `/users/${userId}/runs?${query}` : `/users/${userId}/runs`;

    return this.api.get<{ count: number; runs: Run[] }>(endpoint).pipe(
      map((response) => response.runs || []),
      tap((runs) => {
        this._runs.set(runs);
        this._isLoading.set(false);
      }),
    );
  }

  /**
   * Delete a run
   */
  deleteRun(runId: string): Observable<void> {
    return this.api.delete<void>(`/runs/${runId}`).pipe(
      tap(() => {
        this._runs.update((runs) => runs.filter((run) => run.id !== runId));
      }),
    );
  }

  /**
   * Get run status
   */
  getRunStatus(runId: string): Observable<Run> {
    return this.api.get<Run>(`/status/${runId}`);
  }

  /**
   * Get artifacts for a run
   */
  getArtifacts(runId: string): Observable<Artifact[]> {
    return this.api.get<Artifact[]>(`/runs/${runId}/artifacts`);
  }

  /**
   * Get a specific artifact
   */
  getArtifact(artifactId: string): Observable<Artifact> {
    return this.api.get<Artifact>(`/artifact/${artifactId}`);
  }

  /**
   * Download resume as LaTeX file
   */
  downloadResume(runId: string): Observable<Blob> {
    // Note: This may need adjustment based on actual API response type
    return this.api.get<Blob>(`/runs/${runId}/resume.tex`, {
      responseType: 'blob',
    });
  }
}
