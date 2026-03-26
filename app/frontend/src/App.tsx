/**
 * SheetSchedule - Main App Component
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Schedule, ScheduleCreateRequest, ScheduleUpdateRequest, GanttTask, ReorderItem } from './types';
import { scheduleApi } from './api/schedules';
import GanttChart from './components/GanttChart';
import TimeScaleControl from './components/TimeScaleControl';
import ScheduleModal from './components/ScheduleModal';
import ExportButton from './components/ExportButton';
import FloatingCalendar from './components/FloatingCalendar';
import './App.css';

const SHORT_MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function App() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState(1); // 0=monthly, 1=weekly(default), 2=daily
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  const [visibleMonths, setVisibleMonths] = useState<number[]>([]);
  const [baseMonthOffset, setBaseMonthOffset] = useState(0);

  const toggleMonth = (relativeOffset: number) => {
    const absoluteOffset = baseMonthOffset + relativeOffset;
    setVisibleMonths(prev =>
      prev.includes(absoluteOffset)
        ? prev.filter(m => m !== absoluteOffset)
        : [...prev, absoluteOffset]
    );
  };

  const closeMonth = (absoluteOffset: number) => {
    setVisibleMonths(prev => prev.filter(m => m !== absoluteOffset));
  };

  const isMonthActive = (relativeOffset: number) => {
    return visibleMonths.includes(baseMonthOffset + relativeOffset);
  };

  const getMonthName = (relativeOffset: number) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() + baseMonthOffset + relativeOffset);
    return SHORT_MONTH_NAMES[date.getMonth()];
  };

  const handlePrevMonth = () => {
    setBaseMonthOffset(prev => prev - 1);
  };

  const handleNextMonth = () => {
    setBaseMonthOffset(prev => prev + 1);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedulesData, projectsData] = await Promise.all([
        scheduleApi.getSchedules(selectedProject || undefined),
        scheduleApi.getProjects(),
      ]);
      setSchedules(schedulesData);
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch sheet URL once on mount
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    fetch(`${API_BASE}/sheet-url`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.url) setSheetUrl(data.url); })
      .catch(() => {});
  }, []);

  const handleCreate = async (data: ScheduleCreateRequest) => {
    try {
      const created = await scheduleApi.createSchedule(data);
      setSchedules((prev) => [...prev, created]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create schedule';
      setError(message);
      throw err;
    }
  };

  const handleUpdate = async (data: ScheduleUpdateRequest) => {
    if (!selectedSchedule) return;

    const previousSchedules = [...schedules];

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === selectedSchedule.id ? { ...s, ...data } as Schedule : s
      )
    );

    try {
      await scheduleApi.updateSchedule(selectedSchedule.id, data);
    } catch (err) {
      setSchedules(previousSchedules);
      const message = err instanceof Error ? err.message : 'Failed to update schedule';
      setError(message);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    if (!confirm(`Delete "${selectedSchedule.name}"?`)) return;

    const previousSchedules = [...schedules];

    setSchedules((prev) => prev.filter((s) => s.id !== selectedSchedule.id));
    setModalOpen(false);
    setSelectedSchedule(null);

    try {
      await scheduleApi.deleteSchedule(selectedSchedule.id);
    } catch (err) {
      setSchedules(previousSchedules);
      const message = err instanceof Error ? err.message : 'Failed to delete schedule';
      setError(message);
    }
  };

  const handleTaskChange = async (task: GanttTask, schedule: Schedule) => {
    const startDate = task.start.toISOString().split('T')[0];
    const endDate = task.end.toISOString().split('T')[0];

    const previousSchedules = [...schedules];

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === schedule.id ? { ...s, startDate, endDate } : s
      )
    );

    try {
      await scheduleApi.updateSchedule(schedule.id, {
        startDate,
        endDate,
      });
    } catch (err) {
      setSchedules(previousSchedules);
      const message = err instanceof Error ? err.message : 'Failed to update schedule';
      setError(`Failed to update ${schedule.name}: ${message}`);
    }
  };

  const handleTaskClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setModalOpen(true);
  };

  const handleReorder = async (orders: ReorderItem[]) => {
    const orderMap = new Map(orders.map(o => [o.id, o.displayOrder]));
    const previousSchedules = [...schedules];

    const updatedSchedules = schedules.map(s => ({
      ...s,
      displayOrder: orderMap.get(s.id) ?? s.displayOrder,
    }));
    setSchedules(updatedSchedules);

    try {
      await scheduleApi.reorderSchedules({ orders });
    } catch (err) {
      setSchedules(previousSchedules);
      const message = err instanceof Error ? err.message : 'Failed to reorder';
      setError(`Reorder failed: ${message}`);
    }
  };

  const handleAddNew = () => {
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  const handleSave = async (data: ScheduleCreateRequest | ScheduleUpdateRequest) => {
    if (selectedSchedule) {
      await handleUpdate(data as ScheduleUpdateRequest);
    } else {
      await handleCreate(data as ScheduleCreateRequest);
    }
  };

  // JSON Export
  const handleExportJSON = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      schedules: schedules,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `sheetschedule-${new Date().toISOString().split('T')[0]}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // JSON Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const importedSchedules = data.schedules || data;
        if (!Array.isArray(importedSchedules)) {
          throw new Error('Invalid format');
        }
        if (!confirm(`Import ${importedSchedules.length} schedules? This will create them via the API.`)) return;

        for (const s of importedSchedules) {
          await scheduleApi.createSchedule({
            project: s.project,
            category: s.category,
            name: s.name,
            assignee: s.assignee,
            startDate: s.startDate,
            endDate: s.endDate,
            dependencies: s.dependencies || [],
            status: s.status || 'Planned',
            color: s.color || '#4CAF50',
            memo: s.memo || '',
          });
        }
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Import failed');
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const filteredSchedules = selectedProject
    ? schedules.filter(s => s.project === selectedProject)
    : schedules;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title-group">
          <h1>SheetSchedule</h1>
          {sheetUrl && (
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-open-sheet"
              title="Open source Google Sheet"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
              Open Sheet
            </a>
          )}
        </div>
        <div className="header-controls">
          <select
            className="project-filter"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <TimeScaleControl
            currentLevel={zoomLevel}
            onLevelChange={setZoomLevel}
          />

          <button className="btn-refresh" onClick={loadData} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>

          <ExportButton targetId="gantt-chart" filename="schedule" />

          <button className="btn-export" onClick={handleExportJSON} title="Export data as JSON">
            📥 JSON
          </button>

          <button className="btn-export" onClick={() => fileInputRef.current?.click()} title="Import data from JSON">
            📤 Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            style={{ display: 'none' }}
          />

          <button className="btn-add" onClick={handleAddNew}>
            + New Schedule
          </button>
        </div>

        <div className="calendar-toggle-group">
          <button
            className="calendar-nav-btn"
            onClick={handlePrevMonth}
            title="Previous month"
          >
            ◀
          </button>
          <button
            className={`calendar-toggle-btn ${isMonthActive(-1) ? 'active' : ''}`}
            onClick={() => toggleMonth(-1)}
          >
            {getMonthName(-1)}
          </button>
          <button
            className={`calendar-toggle-btn ${isMonthActive(0) ? 'active' : ''}`}
            onClick={() => toggleMonth(0)}
          >
            {getMonthName(0)}
          </button>
          <button
            className={`calendar-toggle-btn ${isMonthActive(1) ? 'active' : ''}`}
            onClick={() => toggleMonth(1)}
          >
            {getMonthName(1)}
          </button>
          <button
            className="calendar-nav-btn"
            onClick={handleNextMonth}
            title="Next month"
          >
            ▶
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={loadData}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading data...</div>
        ) : (
          <GanttChart
            schedules={filteredSchedules}
            onTaskChange={handleTaskChange}
            onTaskClick={handleTaskClick}
            onReorder={handleReorder}
            zoomLevel={zoomLevel}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>
          Total: {filteredSchedules.length} |
          Completed: {filteredSchedules.filter(s => s.status === 'Completed').length} |
          In Progress: {filteredSchedules.filter(s => s.status === 'In Progress').length} |
          Delayed: {filteredSchedules.filter(s => s.status === 'Delayed').length}
        </span>
      </footer>

      <ScheduleModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSchedule(null);
        }}
        onSave={handleSave}
        onDelete={selectedSchedule ? handleDelete : undefined}
        schedule={selectedSchedule}
        allSchedules={schedules}
        projects={projects}
      />

      <FloatingCalendar
        visibleMonths={visibleMonths}
        onClose={closeMonth}
      />
    </div>
  );
}

export default App;
