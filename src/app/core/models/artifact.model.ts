export interface Artifact {
  id: string;
  run_id: string;
  step: string;
  category: string;
  content: unknown;
  created_at: string;
}

export type ArtifactStep =
  | 'ingestion'
  | 'parsing'
  | 'matching'
  | 'research'
  | 'rewriting'
  | 'output';

export type ArtifactCategory =
  | 'job_profile'
  | 'company_voice'
  | 'selected_bullets'
  | 'rewritten_bullets'
  | 'final_resume';
