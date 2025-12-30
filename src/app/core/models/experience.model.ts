export interface Experience {
  id: string;
  job_id: string;
  bullet_text: string;
  skills: string[];
  risk_flags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateExperienceRequest {
  bullet_text: string;
  skills?: string[];
  risk_flags?: string[];
}

export interface UpdateExperienceRequest {
  bullet_text?: string;
  skills?: string[];
  risk_flags?: string[];
}
