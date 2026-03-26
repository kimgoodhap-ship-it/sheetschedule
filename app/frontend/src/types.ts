/**
 * Scheduler type definitions
 */

export interface Schedule {
  id: string;
  project: string;
  category: string;
  name: string;
  assignee: string;
  startDate: string;
  endDate: string;
  dependencies: string[];
  status: 'Planned' | 'In Progress' | 'Completed' | 'Delayed';
  progress: number;
  color: string;
  memo: string;
  updatedAt: string;
  displayOrder: number;
}

export interface ScheduleCreateRequest {
  project: string;
  category?: string;
  name: string;
  startDate: string;
  endDate: string;
  assignee?: string;
  dependencies?: string[];
  status?: string;
  color?: string;
  memo?: string;
}

export interface ScheduleUpdateRequest {
  project?: string;
  category?: string;
  name?: string;
  assignee?: string;
  startDate?: string;
  endDate?: string;
  dependencies?: string[];
  status?: string;
  color?: string;
  memo?: string;
  displayOrder?: number;
}

export interface ReorderItem {
  id: string;
  displayOrder: number;
}

export interface ReorderRequest {
  orders: ReorderItem[];
}

export interface DependencyInfo {
  schedule_id: string;
  predecessors: string[];
  successors: string[];
  incomplete_predecessors: {
    id: string;
    name: string;
    status: string;
  }[];
  has_warning: boolean;
}

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: 'task' | 'milestone' | 'project';
  dependencies?: string[];
  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
  project?: string;
  hideChildren?: boolean;
  displayOrder?: number;
}
