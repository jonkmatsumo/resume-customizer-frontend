export interface Run {
  id: string;
  user_id?: string;
  company?: string;
  role?: string;
  status: RunStatus;
  created_at: string;
  updated_at: string;
}

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled';

export interface CreateRunRequest {
  job_posting_url?: string;
  job_posting_text?: string;
}

// Step status types
export type StepStatus = 'completed' | 'failed' | 'pending' | 'in_progress' | 'blocked' | 'skipped';

// Pipeline step information
export interface RunStep {
  step: string;
  status: StepStatus;
  run_id: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  artifact_id?: string;
  error?: string;
}

// Step summary counts
export interface StepSummary {
  total: number;
  completed: number;
  failed: number;
  in_progress: number;
  pending: number;
  skipped?: number;
}

// Run steps response (from /v1/runs/{run_id}/steps)
export interface RunStepsResponse {
  run_id: string;
  status: RunStatus;
  steps: RunStep[];
  summary: StepSummary;
}

// Response from GET /v1/runs/{id}
export interface RunDetailResponse {
  id: string;
  user_id: string;
  company: string;
  role_title?: string;
  role?: string; // Fallback
  job_url?: string;
  status: RunStatus;
  created_at: string;
  completed_at?: string;
  updated_at?: string; // Fallback
}

// Step names as constants
export const STEP_NAMES = {
  INGEST_JOB: 'ingest_job',
  PARSE_JOB: 'parse_job',
  MATCH_STORIES: 'match_stories',
  RESEARCH_COMPANY: 'research_company',
  GENERATE_PLAN: 'generate_plan',
  SELECT_BULLETS: 'select_bullets',
  REWRITE_BULLETS: 'rewrite_bullets',
  GENERATE_RESUME: 'generate_resume',
} as const;
