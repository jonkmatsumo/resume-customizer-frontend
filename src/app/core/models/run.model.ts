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
