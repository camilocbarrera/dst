export interface CustomNodeData {
  label: string;
  operator: string;
  status?: 'success' | 'skipped' | 'failed';
}

export interface ParsedYAML {
  dag?: {
    dag_id?: string;
    schedule_interval?: string;
    start_date?: string;
    default_args?: Record<string, unknown>;
  };
  tasks?: Array<{
    task_id: string;
    operator: string;
    [key: string]: string | number | boolean | object;
  }>;
  dependencies?: Array<[string, string]>;
  [key: string]: unknown;
}


