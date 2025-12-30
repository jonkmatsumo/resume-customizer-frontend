export interface Job {
  id: string;
  user_id: string;
  company: string;
  role_title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobRequest {
  company: string;
  role_title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateJobRequest {
  company?: string;
  role_title?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
}
