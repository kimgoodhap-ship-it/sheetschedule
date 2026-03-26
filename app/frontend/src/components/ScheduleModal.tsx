/**
 * Schedule create/edit modal
 */

import { useState, useEffect } from 'react';
import type { Schedule, ScheduleCreateRequest, ScheduleUpdateRequest, DependencyInfo } from '../types';
import { scheduleApi } from '../api/schedules';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ScheduleCreateRequest | ScheduleUpdateRequest) => void;
  onDelete?: () => void;
  schedule?: Schedule | null;
  allSchedules: Schedule[];
  projects: string[];
}

const STATUS_OPTIONS = ['Planned', 'In Progress', 'Completed', 'Delayed', 'TBD'];

const COLOR_OPTIONS = [
  { value: '#F44336', label: '🔴 Red' },
  { value: '#FF9800', label: '🟠 Orange' },
  { value: '#FFEB3B', label: '🟡 Yellow' },
  { value: '#4CAF50', label: '🟢 Green' },
  { value: '#2196F3', label: '🔵 Blue' },
  { value: '#9C27B0', label: '🟣 Purple' },
  { value: '#E91E63', label: '🩷 Pink' },
  { value: '#03A9F4', label: '🩵 Sky' },
  { value: '#795548', label: '🤎 Brown' },
  { value: '#607D8B', label: '⚫ Gray' },
];

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  schedule,
  allSchedules,
  projects,
}: ScheduleModalProps) {
  const [formData, setFormData] = useState({
    project: '',
    category: '',
    name: '',
    assignee: '',
    startDate: '',
    endDate: '',
    dependencies: [] as string[],
    status: 'Planned',
    color: '#4CAF50',
    memo: '',
  });
  const [dependencyInfo, setDependencyInfo] = useState<DependencyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schedule) {
      setFormData({
        project: schedule.project || '',
        category: schedule.category || '',
        name: schedule.name || '',
        assignee: schedule.assignee || '',
        startDate: schedule.startDate || '',
        endDate: schedule.endDate || '',
        dependencies: schedule.dependencies || [],
        status: schedule.status || 'Planned',
        color: schedule.color || '#4CAF50',
        memo: schedule.memo || '',
      });

      scheduleApi.getDependencies(schedule.id)
        .then(setDependencyInfo)
        .catch(() => setDependencyInfo(null));
    } else {
      setFormData({
        project: '',
        category: '',
        name: '',
        assignee: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        dependencies: [],
        status: 'Planned',
        color: '#4CAF50',
        memo: '',
      });
      setDependencyInfo(null);
    }
    setError('');
  }, [schedule, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDependencyChange = (scheduleId: string) => {
    setFormData(prev => {
      const deps = prev.dependencies.includes(scheduleId)
        ? prev.dependencies.filter(d => d !== scheduleId)
        : [...prev.dependencies, scheduleId];
      return { ...prev, dependencies: deps };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        throw new Error('End date must be after start date.');
      }

      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const availableDependencies = allSchedules.filter(s =>
    s.id !== schedule?.id && s.project === formData.project
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{schedule ? 'Edit Schedule' : 'New Schedule'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {dependencyInfo?.has_warning && (
          <div className="dependency-warning">
            Incomplete predecessors:
            {dependencyInfo.incomplete_predecessors.map(p => (
              <span key={p.id} className="warning-item">{p.name} ({p.status})</span>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Project *
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                list="project-list"
                required
              />
              <datalist id="project-list">
                {projects.map(p => <option key={p} value={p} />)}
              </datalist>
            </label>

            <label>
              Category
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Strategy, Production, Sales"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Task Name *
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Assignee
              <input
                type="text"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Status
              <select name="status" value={formData.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Start Date *
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              End Date *
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Color
              <select name="color" value={formData.color} onChange={handleChange}>
                {COLOR_OPTIONS.map(c => (
                  <option key={c.value} value={c.value} style={{ backgroundColor: c.value }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {availableDependencies.length > 0 && (
            <div className="form-group">
              <label>Dependencies</label>
              <div className="dependency-list">
                {availableDependencies.map(s => (
                  <label key={s.id} className="dependency-item">
                    <input
                      type="checkbox"
                      checked={formData.dependencies.includes(s.id)}
                      onChange={() => handleDependencyChange(s.id)}
                    />
                    <span style={{ backgroundColor: s.color }} className="dep-color"></span>
                    {s.name} ({s.project})
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label>
              Memo
              <textarea
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                rows={3}
              />
            </label>
          </div>

          <div className="modal-actions">
            {schedule && onDelete && (
              <button type="button" className="btn-delete" onClick={onDelete}>
                Delete
              </button>
            )}
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
