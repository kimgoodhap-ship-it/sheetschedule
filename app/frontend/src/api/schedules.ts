/**
 * Schedule API client
 */

import type { Schedule, ScheduleCreateRequest, ScheduleUpdateRequest, DependencyInfo, ReorderRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export const scheduleApi = {
  getSchedules: (project?: string): Promise<Schedule[]> => {
    const params = project ? `?project=${encodeURIComponent(project)}` : '';
    return fetchApi<Schedule[]>(`/schedules${params}`);
  },

  getSchedule: (scheduleId: string): Promise<Schedule> => {
    return fetchApi<Schedule>(`/schedules/${scheduleId}`);
  },

  createSchedule: (data: ScheduleCreateRequest): Promise<Schedule> => {
    return fetchApi<Schedule>('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateSchedule: (scheduleId: string, data: ScheduleUpdateRequest): Promise<Schedule> => {
    return fetchApi<Schedule>(`/schedules/${scheduleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteSchedule: (scheduleId: string): Promise<{ message: string }> => {
    return fetchApi<{ message: string }>(`/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
  },

  getDependencies: (scheduleId: string): Promise<DependencyInfo> => {
    return fetchApi<DependencyInfo>(`/schedules/${scheduleId}/dependencies`);
  },

  getProjects: (): Promise<string[]> => {
    return fetchApi<string[]>('/projects?source=schedules');
  },

  reorderSchedules: (request: ReorderRequest): Promise<{ message: string; updated_count: number }> => {
    return fetchApi<{ message: string; updated_count: number }>('/schedules/reorder', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  syncOrder: (orderedIds: string[]): Promise<{ message: string; synced_count: number }> => {
    return fetchApi<{ message: string; synced_count: number }>('/schedules/sync-order', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    });
  },
};
