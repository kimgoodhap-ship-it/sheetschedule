/**
 * Gantt Chart component (gantt-task-react)
 * - Weekly default + dynamic browser width calculation
 * - Hide dates after task end date
 * - Display end date inside bar
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Gantt, type Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import type { Schedule, GanttTask, ReorderItem } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
} from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// Holiday utilities import removed - no longer needed for English version

// Zoom level settings (0=Month, 1=Week, 2=Day)
const ZOOM_TO_VIEW_MODE: ViewMode[] = [ViewMode.Month, ViewMode.Week, ViewMode.Day];

// Helper function to parse date strings in local timezone
// Supports various formats: "2026-01-08", "2026. 1. 30", "2026/01/08", "2026.01.08"
function parseLocalDate(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') return new Date();

  // Clean string: remove whitespace and normalize delimiters
  const cleaned = dateStr.trim();

  // Try parsing various formats
  let year: number, month: number, day: number;

  // Format 1: "YYYY-MM-DD" (ISO format)
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-').map(s => parseInt(s.trim(), 10));
    [year, month, day] = parts;
  }
  // Format 2: "YYYY. M. D" or "YYYY.MM.DD" (Google Sheets format)
  else if (cleaned.includes('.')) {
    const parts = cleaned.split('.').map(s => parseInt(s.trim(), 10));
    [year, month, day] = parts;
  }
  // Format 3: "YYYY/MM/DD"
  else if (cleaned.includes('/')) {
    const parts = cleaned.split('/').map(s => parseInt(s.trim(), 10));
    [year, month, day] = parts;
  }
  // Unknown format: return default
  else {
    console.warn(`parseLocalDate: Unknown date format "${dateStr}"`);
    return new Date();
  }

  // Validation
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    console.warn(`parseLocalDate: Parse failed "${dateStr}" → year=${year}, month=${month}, day=${day}`);
    return new Date();
  }

  return new Date(year, month - 1, day);
}

// Helper function to darken a color
function darkenColor(hex: string, factor: number): string {
  // Convert hex color to RGB
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Darken adjustment
  const newR = Math.max(0, Math.floor(r * (1 - factor)));
  const newG = Math.max(0, Math.floor(g * (1 - factor)));
  const newB = Math.max(0, Math.floor(b * (1 - factor)));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Grid area width (project, task name, assignee, end date columns)
const GRID_WIDTH = 510;

// Weekly view column width (wide setting)
const WEEK_COLUMN_WIDTH = 150;

// Week of month calculation (W1~W5)
function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
}

// Calculate number of weeks in a month
function getWeeksInMonth(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const lastDate = lastDay.getDate();
  return Math.ceil((lastDate + firstDayOfWeek) / 7);
}

// Generate custom 2-row header data (month + week)
interface HeaderData {
  months: { year: number; month: number; label: string; width: number; startX: number; weeksCount: number }[];
  weeks: { year: number; month: number; week: number; label: string; width: number; x: number }[];
  totalWidth: number;
}

function generateHeaderData(startDate: Date, endDate: Date, colWidth: number): HeaderData {
  const months: HeaderData['months'] = [];
  const weeks: HeaderData['weeks'] = [];

  // Calculate from the first week of the start month
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  // Calculate end date week (+1 week buffer)
  const endWeekOfMonth = getWeekOfMonth(endDate);
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  // Add 1 week buffer (up to max weeks in the month)
  const maxWeekInEndMonth = Math.min(endWeekOfMonth + 1, getWeeksInMonth(endYear, endMonth));

  let currentYear = start.getFullYear();
  let currentMonth = start.getMonth();
  let currentX = 0;

  while (currentYear < endYear ||
         (currentYear === endYear && currentMonth <= endMonth)) {
    const weeksInMonth = getWeeksInMonth(currentYear, currentMonth);
    const monthStartX = currentX;

    // Show only limited weeks for the last month
    const isLastMonth = currentYear === endYear && currentMonth === endMonth;
    const weeksToShow = isLastMonth ? maxWeekInEndMonth : weeksInMonth;

    let weekCount = 0;

    // Add weeks
    for (let w = 1; w <= weeksToShow; w++) {
      weeks.push({
        year: currentYear,
        month: currentMonth,
        week: w,
        label: `W${w}`,
        width: colWidth,
        x: currentX,
      });
      currentX += colWidth;
      weekCount++;
    }

    // Add month (with year) - only for the displayed weeks
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.push({
      year: currentYear,
      month: currentMonth,
      label: `${monthNames[currentMonth]}, ${currentYear}`,
      width: weekCount * colWidth,
      startX: monthStartX,
      weeksCount: weekCount,
    });

    // Move to next month
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return { months, weeks, totalWidth: currentX };
}

interface GanttChartProps {
  schedules: Schedule[];
  onTaskChange: (task: GanttTask, schedule: Schedule) => void;
  onTaskClick: (schedule: Schedule) => void;
  onReorder?: (orders: ReorderItem[]) => Promise<void>;
  zoomLevel: number;
}

// Category colors
const CATEGORY_COLORS: Record<string, { bar: string; progress: string }> = {
  'Sales': { bar: '#4DB6AC', progress: '#00897B' },
  'Marketing': { bar: '#FF8A65', progress: '#F4511E' },
  'Development': { bar: '#7986CB', progress: '#3F51B5' },
  'Planning': { bar: '#BA68C8', progress: '#8E24AA' },
  'Design': { bar: '#FFB74D', progress: '#FF9800' },
  'default': { bar: '#90A4AE', progress: '#607D8B' },
};

// Generate consistent color per project (hash-based)
const PROJECT_COLORS = [
  '#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#E0F7FA',
  '#FBE9E7', '#F1F8E9', '#E8EAF6', '#FCE4EC', '#E0F2F1',
];

function getProjectColor(projectName: string): string {
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    hash = ((hash << 5) - hash) + projectName.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

// Project info map (task.id → projectName)
let taskProjectMap: Map<string, string> = new Map();

// Convert Schedule to gantt-task-react Task format
function scheduleToGanttTask(schedule: Schedule, parentId?: string): Task {
  // Parse dates in local timezone (prevent UTC conversion)
  const start = parseLocalDate(schedule.startDate);
  const end = parseLocalDate(schedule.endDate);

  // Set to today if date is invalid
  const validStart = isNaN(start.getTime()) ? new Date() : start;
  const validEnd = isNaN(end.getTime()) ? new Date(validStart.getTime() + 86400000) : end;

  // Set end date to start date if end is before start
  let finalEnd = validEnd < validStart ? new Date(validStart) : validEnd;

  // Set end date to end of day (23:59:59) for gantt-task-react bar display correction
  // This ensures single-day tasks (start=end) are displayed correctly
  finalEnd = new Date(finalEnd.getFullYear(), finalEnd.getMonth(), finalEnd.getDate(), 23, 59, 59, 999);

  // Color determination: schedule.color first, fallback to category-based
  let barColor: string;
  let progressColor: string;

  if (schedule.color && schedule.color.trim() !== '') {
    // Use color column value from Google Sheets
    barColor = schedule.color;
    // Progress color is slightly darker than bar color
    progressColor = darkenColor(schedule.color, 0.2);
  } else {
    // fallback: category-based colors
    const colors = CATEGORY_COLORS[schedule.category] || CATEGORY_COLORS['default'];
    barColor = colors.bar;
    progressColor = colors.progress;
  }

  return {
    id: schedule.id,
    name: schedule.name,
    start: validStart,
    end: finalEnd,
    progress: schedule.progress,
    type: 'task',
    project: parentId,  // Parent group ID (if any)
    styles: {
      backgroundColor: barColor,
      backgroundSelectedColor: barColor,
      progressColor: progressColor,
      progressSelectedColor: progressColor,
    },
    // dependencies: schedule.dependencies || [],
  };
}

// Create project group Task (transparent bar)
function createProjectTask(
  projectName: string,
  schedules: Schedule[],
  isExpanded: boolean
): Task {
  // Calculate min start date and max end date from all schedules in this project
  let minStart = new Date('2100-01-01');
  let maxEnd = new Date('1970-01-01');

  schedules.forEach((s) => {
    const start = parseLocalDate(s.startDate);
    const end = parseLocalDate(s.endDate);
    if (!isNaN(start.getTime()) && start < minStart) minStart = start;
    if (!isNaN(end.getTime()) && end > maxEnd) maxEnd = end;
  });

  // Set to today if no valid dates
  if (minStart > maxEnd) {
    minStart = new Date();
    maxEnd = new Date(minStart.getTime() + 7 * 86400000);
  }

  return {
    id: `project-${projectName}`,
    name: projectName,
    start: minStart,
    end: maxEnd,
    progress: 0,
    type: 'project',
    hideChildren: !isExpanded,
    // Transparent bar (not displayed on Gantt chart)
    styles: {
      backgroundColor: 'transparent',
      backgroundSelectedColor: 'transparent',
      progressColor: 'transparent',
      progressSelectedColor: 'transparent',
    },
  };
}

// Create category group Task (transparent bar)
function createCategoryTask(
  categoryKey: string,  // "project|category" format
  categoryName: string,
  schedules: Schedule[],
  isExpanded: boolean,
  parentProjectId: string
): Task {
  // Calculate min start date and max end date from all schedules in this category
  let minStart = new Date('2100-01-01');
  let maxEnd = new Date('1970-01-01');

  schedules.forEach((s) => {
    const start = parseLocalDate(s.startDate);
    const end = parseLocalDate(s.endDate);
    if (!isNaN(start.getTime()) && start < minStart) minStart = start;
    if (!isNaN(end.getTime()) && end > maxEnd) maxEnd = end;
  });

  // Set to today if no valid dates
  if (minStart > maxEnd) {
    minStart = new Date();
    maxEnd = new Date(minStart.getTime() + 7 * 86400000);
  }

  return {
    id: categoryKey,
    name: categoryName,
    start: minStart,
    end: maxEnd,
    progress: 0,
    type: 'project',
    project: parentProjectId,  // Reference to parent project
    hideChildren: !isExpanded,
    // Transparent bar (not displayed on Gantt chart)
    styles: {
      backgroundColor: 'transparent',
      backgroundSelectedColor: 'transparent',
      progressColor: 'transparent',
      progressSelectedColor: 'transparent',
    },
  };
}

// Calculate the number of time units gantt-task-react actually renders
function getTimeUnitsCount(schedules: Schedule[], viewMode: ViewMode): number {
  if (schedules.length === 0) return 10;

  // Set initial values to extremes so all dates are compared
  let minDate = new Date('2100-01-01');
  let maxDate = new Date('1970-01-01');

  schedules.forEach((s) => {
    const start = parseLocalDate(s.startDate);
    const end = parseLocalDate(s.endDate);
    if (!isNaN(start.getTime()) && start < minDate) minDate = start;
    if (!isNaN(end.getTime()) && end > maxDate) maxDate = end;
  });

  // Return default if no valid date range
  if (minDate > maxDate) return 10;

  const diffTime = maxDate.getTime() - minDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // gantt-task-react renders task range + padding before/after
  // Adjusted to match the library's actual rendering range
  switch (viewMode) {
    case ViewMode.Month:
      return Math.ceil(diffDays / 30) + 4; // Monthly: 2 months padding
    case ViewMode.Week:
      return Math.ceil(diffDays / 7) + 6; // Weekly: 3 weeks padding each side
    case ViewMode.Day:
      return diffDays + 14; // Daily: 1 week padding each side
    default:
      return Math.ceil(diffDays / 7) + 6;
  }
}

// Dynamic columnWidth calculation (fit exactly to browser width)
const WRAPPER_PADDING = 32; // padding: 1rem * 2

// Minimum columnWidth per view mode (daily is larger to prevent text overlap)
const MIN_COLUMN_WIDTH: Record<ViewMode, number> = {
  [ViewMode.Day]: 65,    // Daily: prevent text overlap for "Thu, 26" etc (~65px needed)
  [ViewMode.Week]: 150,  // Weekly: wider columns for readability
  [ViewMode.Month]: 25,  // Monthly: fit to screen
  [ViewMode.Year]: 25,
  [ViewMode.QuarterDay]: 65,
  [ViewMode.HalfDay]: 65,
  [ViewMode.Hour]: 65,
};

function calculateColumnWidth(
  containerWidth: number,
  timeUnits: number,
  viewMode: ViewMode
): number {
  // containerWidth is wrapper's clientWidth (including padding)
  // Available chart area = containerWidth - padding - grid
  const chartWidth = containerWidth - WRAPPER_PADDING - GRID_WIDTH;
  const minWidth = MIN_COLUMN_WIDTH[viewMode] || 25;
  // Calculate to fit screen exactly (guarantee minimum per view mode)
  return Math.max(minWidth, Math.floor(chartWidth / timeUnits));
}

// Helper function to convert ISO week → monthly week (Monday-based)
// Rule: The week is assigned to the month that contains its Monday
function getMonthWeek(isoWeek: number, year: number): { month: number; weekOfMonth: number } {
  // Calculate Monday date from ISO week number
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const firstIsoMonday = new Date(year, 0, 4 - dayOfWeek + 1);

  // Monday of the given ISO week
  const mondayOfWeek = new Date(firstIsoMonday);
  mondayOfWeek.setDate(firstIsoMonday.getDate() + (isoWeek - 1) * 7);

  // The month containing Monday = the month the week belongs to
  const month = mondayOfWeek.getMonth() + 1;
  const monthYear = mondayOfWeek.getFullYear();

  // Find the first Monday of the month
  const firstOfMonth = new Date(monthYear, mondayOfWeek.getMonth(), 1);
  const firstDayOfWeek = firstOfMonth.getDay(); // 0=Sun, 1=Mon, ...

  // Date of the first Monday of the month
  let firstMondayOfMonth: Date;
  if (firstDayOfWeek === 0) {
    // If 1st is Sunday, next day (2nd) is first Monday
    firstMondayOfMonth = new Date(monthYear, mondayOfWeek.getMonth(), 2);
  } else if (firstDayOfWeek === 1) {
    // 1st is Monday
    firstMondayOfMonth = new Date(monthYear, mondayOfWeek.getMonth(), 1);
  } else {
    // Next week Monday
    firstMondayOfMonth = new Date(monthYear, mondayOfWeek.getMonth(), 1 + (8 - firstDayOfWeek));
  }

  // If Monday is before the first Monday of the month, treat as last week of previous month
  if (mondayOfWeek < firstMondayOfMonth) {
    // Calculate from previous month
    const prevMonth = mondayOfWeek.getMonth() === 0 ? 12 : mondayOfWeek.getMonth();
    const prevYear = mondayOfWeek.getMonth() === 0 ? monthYear - 1 : monthYear;
    const prevFirstOfMonth = new Date(prevYear, prevMonth - 1, 1);
    const prevFirstDayOfWeek = prevFirstOfMonth.getDay();

    let prevFirstMonday: Date;
    if (prevFirstDayOfWeek === 0) {
      prevFirstMonday = new Date(prevYear, prevMonth - 1, 2);
    } else if (prevFirstDayOfWeek === 1) {
      prevFirstMonday = new Date(prevYear, prevMonth - 1, 1);
    } else {
      prevFirstMonday = new Date(prevYear, prevMonth - 1, 1 + (8 - prevFirstDayOfWeek));
    }

    const weekOfMonth = Math.floor((mondayOfWeek.getTime() - prevFirstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return { month: prevMonth, weekOfMonth: Math.min(weekOfMonth, 5) };
  }

  // Calculate which week of the month
  const weekOfMonth = Math.floor((mondayOfWeek.getTime() - firstMondayOfMonth.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return { month, weekOfMonth: Math.min(weekOfMonth, 5) };
}

// Day abbreviation map (English)
const DAY_MAP: Record<string, string> = {
  'Mon': 'Mon', 'Tue': 'Tue', 'Wed': 'Wed', 'Thu': 'Thu',
  'Fri': 'Fri', 'Sat': 'Sat', 'Sun': 'Sun'
};

// Map to store memos (task.id → memo)
// Populated from schedules data in GanttChart component
let taskMemoMap: Map<string, string> = new Map();

// Custom tooltip component (show only memo on hover)
function TooltipContent({ task }: { task: Task }) {
  const memo = taskMemoMap.get(task.id) || '';

  // Don't show tooltip if no memo
  if (!memo) {
    return null;
  }

  // Show only memo (exclude task name)
  return (
    <div style={{
      padding: '10px 14px',
      background: 'white',
      borderRadius: '6px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      fontSize: '13px',
      maxWidth: '300px',
    }}>
      <div style={{ color: '#333', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>{memo}</div>
    </div>
  );
}

// Task list column widths: drag handle(24px) + project(90px) + task name(210px) + assignee(70px) + start(70px) + end(70px)
const TASK_LIST_COLUMNS = '24px 90px 210px 70px 70px 70px';

// Custom TaskListHeader - match header height to gantt-task-react chart header (50px)
function TaskListHeader() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: TASK_LIST_COLUMNS,
      background: '#f5f5f5',
      padding: '0 12px',
      fontWeight: 600,
      fontSize: '13px',
      borderBottom: '1px solid #e0e0e0',
      height: '50px',
      alignItems: 'center',
    }}>
      <div></div>
      <div>Project</div>
      <div>Task</div>
      <div style={{ textAlign: 'center' }}>Assignee</div>
      <div style={{ textAlign: 'center' }}>Start</div>
      <div style={{ textAlign: 'center' }}>End</div>
    </div>
  );
}

// Drag handle component
interface DragHandleProps {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
}

function DragHandle({ listeners, attributes }: DragHandleProps) {
  return (
    <div
      {...listeners}
      {...attributes}
      style={{
        cursor: 'grab',
        color: '#999',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
      }}
      title="Drag to reorder"
    >
      ⋮⋮
    </div>
  );
}

// SortableTaskRow - draggable task row
interface SortableTaskRowProps {
  task: Task;
  projectName: string;
  assignee: string;
  startDate: string;
  endDate: string;
}

function SortableTaskRow({ task, projectName, assignee, startDate, endDate }: SortableTaskRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: TASK_LIST_COLUMNS,
        padding: '0 12px',
        borderBottom: '1px solid #f0f0f0',
        fontSize: '13px',
        alignItems: 'center',
        height: '40px',
        background: isDragging ? '#e3f2fd' : 'white',
      }}
    >
      <DragHandle listeners={listeners} attributes={attributes} />
      <div style={{ color: '#999', fontSize: '11px' }}>
        {projectName}
      </div>
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingLeft: '20px',
        }}
        title={task.name}
      >
        {task.name}
      </div>
      <div style={{ textAlign: 'center', color: '#666' }}>
        {assignee}
      </div>
      <div style={{ textAlign: 'center', color: '#666' }}>
        {startDate}
      </div>
      <div style={{ textAlign: 'center', color: '#666' }}>
        {endDate}
      </div>
    </div>
  );
}

// SortableCategoryRow - draggable category row
interface SortableCategoryRowProps {
  task: Task;
  isExpanded: boolean;
  startDate: string;
  endDate: string;
  onExpand: () => void;
}

function SortableCategoryRow({ task, isExpanded, startDate, endDate, onExpand }: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: TASK_LIST_COLUMNS,
        padding: '0 12px',
        borderBottom: '1px solid #e0e0e0',
        fontSize: '13px',
        alignItems: 'center',
        height: '40px',
        background: isDragging ? '#bbdefb' : '#f8f9fa',
        fontWeight: 600,
      }}
    >
      <DragHandle listeners={listeners} attributes={attributes} />
      <div></div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        title={task.name}
        onClick={onExpand}
      >
        <span style={{
          fontSize: '10px',
          color: '#666',
          transition: 'transform 0.2s',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>
          ▶
        </span>
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {task.name}
        </span>
      </div>
      <div></div>
      <div style={{ textAlign: 'center', color: '#666' }}>
        {startDate}
      </div>
      <div style={{ textAlign: 'center', color: '#666' }}>
        {endDate}
      </div>
    </div>
  );
}

// Assignee map (task.id → assignee)
let taskAssigneeMap: Map<string, string> = new Map();

// Category-task mapping (categoryKey → taskIds[])
let categoryTasksMap: Map<string, string[]> = new Map();

// Expand/collapse handler (global reference)
let expanderClickHandler: ((task: Task) => void) | null = null;

// Row type detection: project-xxx → project, xxx|xxx → category, others → task
type RowType = 'project' | 'category' | 'task';

function getRowType(task: Task): RowType {
  if (task.id.startsWith('project-')) return 'project';
  if (task.type === 'project' && task.id.includes('|')) return 'category';
  return 'task';
}

// Module-level reorder handler (set by GanttChart)
let reorderHandler: ((orders: ReorderItem[]) => Promise<void>) | null = null;

// Custom TaskListTable (project, task name, assignee, end date display + group expand/collapse + drag and drop)
function TaskListTable({ tasks }: { tasks: Task[] }) {
  // Drag sensor setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Start drag after 8px movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Extract category rows and task rows
  const categoryRows = tasks.filter(task => getRowType(task) === 'category');
  const taskRows = tasks.filter(task => getRowType(task) === 'task');

  // IDs of all draggable items (categories + tasks)
  const categoryIds = categoryRows.map(task => task.id);
  const taskIds = taskRows.map(task => task.id);
  const allDraggableIds = [...categoryIds, ...taskIds];

  // Drag end handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determine if category drag or task drag
    const isActiveCategory = activeId.includes('|');
    const isOverCategory = overId.includes('|');

    if (isActiveCategory) {
      // Category drag: move all child tasks
      handleCategoryReorder(activeId, overId, categoryIds, isOverCategory);
    } else {
      // Task drag: existing logic
      const oldIndex = taskIds.indexOf(activeId);
      const newIndex = taskIds.indexOf(overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedIds = arrayMove(taskIds, oldIndex, newIndex);
        const orders: ReorderItem[] = reorderedIds.map((id, index) => ({
          id,
          displayOrder: (index + 1) * 10,
        }));
        if (reorderHandler) {
          reorderHandler(orders);
        }
      }
    }
  }, [categoryIds, taskIds]);

  // Category reorder handler (only within the same project)
  const handleCategoryReorder = useCallback((
    activeCategoryId: string,
    overItemId: string,
    allCategoryIds: string[],
    isOverCategory: boolean
  ) => {
    // Active category's task list
    const activeTaskIds = categoryTasksMap.get(activeCategoryId) || [];
    if (activeTaskIds.length === 0) {
      console.warn('[Category Drag] No tasks found for category:', activeCategoryId);
      return;
    }

    // Extract project name from category ID (format: "projectName|categoryName")
    const getProjectFromCategoryId = (catId: string) => catId.split('|')[0];
    const activeProject = getProjectFromCategoryId(activeCategoryId);

    // If target is a category
    let targetCategoryId = overItemId;
    if (!isOverCategory) {
      // If dragged over a task, find its category
      for (const [catId, taskIdsInCat] of categoryTasksMap.entries()) {
        if (taskIdsInCat.includes(overItemId)) {
          targetCategoryId = catId;
          break;
        }
      }
    }

    // Can only move within the same project
    const targetProject = getProjectFromCategoryId(targetCategoryId);
    if (activeProject !== targetProject) {
      console.warn('[Category Drag] Cannot move between projects:', activeProject, '→', targetProject);
      return;
    }

    // Ignore if moving to the same category
    if (activeCategoryId === targetCategoryId) return;

    // Filter only categories in the same project
    const projectCategoryIds = allCategoryIds.filter(
      catId => getProjectFromCategoryId(catId) === activeProject
    );

    const oldIndex = projectCategoryIds.indexOf(activeCategoryId);
    const newIndex = projectCategoryIds.indexOf(targetCategoryId);

    if (oldIndex === -1 || newIndex === -1) {
      console.warn('[Category Drag] Index not found:', { oldIndex, newIndex, activeCategoryId, targetCategoryId });
      return;
    }

    // Reorder categories within the project
    const reorderedProjectCategories = arrayMove(projectCategoryIds, oldIndex, newIndex);

    // Calculate new displayOrder
    // Keep existing order while replacing only categories in the same project with new order
    let newOrders: ReorderItem[] = [];
    let displayOrder = 10;

    // Reordered category index mapping (only categories from the active project)
    let reorderedIndex = 0;

    allCategoryIds.forEach(catId => {
      const catProject = getProjectFromCategoryId(catId);

      if (catProject === activeProject) {
        // Same project: use reordered sequence
        const reorderedCatId = reorderedProjectCategories[reorderedIndex];
        reorderedIndex++;

        const taskIdsInCat = categoryTasksMap.get(reorderedCatId) || [];
        taskIdsInCat.forEach(taskId => {
          newOrders.push({ id: taskId, displayOrder });
          displayOrder += 10;
        });
      } else {
        // Different project: keep existing order
        const taskIdsInCat = categoryTasksMap.get(catId) || [];
        taskIdsInCat.forEach(taskId => {
          newOrders.push({ id: taskId, displayOrder });
          displayOrder += 10;
        });
      }
    });

    if (newOrders.length > 0 && reorderHandler) {
      console.log('[Category Drag] Reordering', newOrders.length, 'tasks');
      reorderHandler(newOrders);
    }
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={allDraggableIds} strategy={verticalListSortingStrategy}>
        <div>
          {tasks.map((task) => {
            const rowType = getRowType(task);
            const isExpanded = !task.hideChildren;

            // Start date format: "1/20"
            const startMonth = task.start.getMonth() + 1;
            const startDay = task.start.getDate();
            const startDate = `${startMonth}/${startDay}`;
            // End date format: "1/20"
            const endMonth = task.end.getMonth() + 1;
            const endDay = task.end.getDate();
            const endDate = `${endMonth}/${endDay}`;
            const assignee = taskAssigneeMap.get(task.id) || '';
            const projectName = taskProjectMap.get(task.id) || '';

            // Project row (displayed in first column, random background color) - not draggable
            if (rowType === 'project') {
              const bgColor = getProjectColor(task.name);
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: TASK_LIST_COLUMNS,
                    padding: '0 12px',
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: '13px',
                    alignItems: 'center',
                    height: '40px',
                    background: bgColor,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => expanderClickHandler?.(task)}
                >
                  <div></div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      overflow: 'hidden',
                    }}
                    title={task.name}
                  >
                    <span style={{
                      fontSize: '10px',
                      color: '#666',
                      transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}>
                      ▶
                    </span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {task.name}
                    </span>
                  </div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              );
            }

            // Category row - draggable
            if (rowType === 'category') {
              return (
                <SortableCategoryRow
                  key={task.id}
                  task={task}
                  isExpanded={isExpanded}
                  startDate={startDate}
                  endDate={endDate}
                  onExpand={() => expanderClickHandler?.(task)}
                />
              );
            }

            // Task row (draggable)
            return (
              <SortableTaskRow
                key={task.id}
                task={task}
                projectName={projectName}
                assignee={assignee}
                startDate={startDate}
                endDate={endDate}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default function GanttChart({
  schedules,
  onTaskChange,
  onTaskClick,
  onReorder,
  zoomLevel,
}: GanttChartProps) {
  // Set module-level handler
  useEffect(() => {
    reorderHandler = onReorder || null;
    return () => {
      reorderHandler = null;
    };
  }, [onReorder]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnWidth, setColumnWidth] = useState(WEEK_COLUMN_WIDTH);
  // Project expand/collapse state - all expanded by default
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(() => new Set());
  // Category expand/collapse state - all expanded by default
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  // Hovered task ID (for dependency line display)
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  // Bar position cache (task ID → rect coordinates)
  const barPositionsRef = useRef<Map<string, { x: number; y: number; width: number; height: number }>>(new Map());

  // Determine ViewMode (calculate first)
  const viewMode = ZOOM_TO_VIEW_MODE[zoomLevel] || ViewMode.Week;

  // Calculate task date range (start ~ end)
  const dateRange = useMemo(() => {
    if (schedules.length === 0) {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0),
      };
    }

    let minDate = new Date('2100-01-01');
    let maxDate = new Date('1900-01-01');

    schedules.forEach((s) => {
      const start = parseLocalDate(s.startDate);
      const end = parseLocalDate(s.endDate);
      if (!isNaN(start.getTime()) && start < minDate) minDate = start;
      if (!isNaN(end.getTime()) && end > maxDate) maxDate = end;
    });

    // Default to current month if no valid dates
    if (minDate.getTime() === new Date('2100-01-01').getTime()) {
      const now = new Date();
      minDate = new Date(now.getFullYear(), now.getMonth(), 1);
      maxDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    }

    return { startDate: minDate, endDate: maxDate };
  }, [schedules]);

  // Generate custom header data (for future custom header implementation)
  const headerData = useMemo(() => {
    return generateHeaderData(dateRange.startDate, dateRange.endDate, columnWidth);
  }, [dateRange, columnWidth]);
  // headerData will be used for future custom header implementation
  void headerData;

  // Auto-calculate view start date based on task duration
  const viewDate = useMemo(() => {
    // Set to 1st of start month
    return new Date(dateRange.startDate.getFullYear(), dateRange.startDate.getMonth(), 1);
  }, [dateRange]);

  // Project/category expand/collapse handler
  const handleExpanderClick = (task: Task) => {
    if (task.type !== 'project') return;

    // Distinguish between project row and category row
    const isProjectRow = task.id.startsWith('project-');

    if (isProjectRow) {
      setExpandedProjects((prev) => {
        const next = new Set(prev);
        if (next.has(task.id)) {
          next.delete(task.id);
        } else {
          next.add(task.id);
        }
        return next;
      });
    } else {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(task.id)) {
          next.delete(task.id);
        } else {
          next.add(task.id);
        }
        return next;
      });
    }
  };

  // Connect global handler
  expanderClickHandler = handleExpanderClick;

  // Convert data to gantt-task-react format + 3-level grouping (project > category > task)
  const tasks = useMemo(() => {
    // Initialize memo/assignee/project maps
    taskMemoMap = new Map();
    taskAssigneeMap = new Map();
    taskProjectMap = new Map();
    schedules.forEach((s) => {
      taskMemoMap.set(s.id, s.memo || '');
      taskAssigneeMap.set(s.id, s.assignee || '');
      taskProjectMap.set(s.id, s.project || '');
    });

    // Check if both project and category exist
    const hasProjectAndCategory = schedules.some(
      (s) => s.project && s.project.trim() !== '' && s.category && s.category.trim() !== ''
    );

    if (!hasProjectAndCategory) {
      // If no project/category, use flat list
      return schedules.map((s) => scheduleToGanttTask(s));
    }

    // 3-level grouping: project > category > task
    // 1. Group schedules by project
    const projectSchedules = new Map<string, Schedule[]>();
    const ungroupedSchedules: Schedule[] = [];

    schedules.forEach((s) => {
      if (s.project && s.project.trim() !== '') {
        const projectKey = s.project.trim();
        if (!projectSchedules.has(projectKey)) {
          projectSchedules.set(projectKey, []);
        }
        projectSchedules.get(projectKey)!.push(s);
      } else {
        ungroupedSchedules.push(s);
      }
    });

    // Create result Task array
    const result: Task[] = [];

    // Initialize category-task mapping (for drag and drop)
    categoryTasksMap.clear();

    // Sort projects by displayOrder (use minimum displayOrder per project)
    const getMinDisplayOrder = (scheds: Schedule[]) =>
      Math.min(...scheds.map(s => s.displayOrder || 0));

    const sortedProjects = Array.from(projectSchedules.keys()).sort((a, b) => {
      const orderA = getMinDisplayOrder(projectSchedules.get(a)!);
      const orderB = getMinDisplayOrder(projectSchedules.get(b)!);
      return orderA - orderB;
    });

    sortedProjects.forEach((projectName) => {
      const projectId = `project-${projectName}`;
      const projectScheds = projectSchedules.get(projectName)!;

      // Collapse state: if in Set, collapsed; if not, expanded
      const isProjectExpanded = !expandedProjects.has(projectId);

      // Add project Task (transparent bar)
      const projectTask = createProjectTask(projectName, projectScheds, isProjectExpanded);
      result.push(projectTask);

      // Only process children if project is expanded
      if (isProjectExpanded) {
        // 2. Group by category within project
        const categorySchedules = new Map<string, Schedule[]>();
        const projectUngrouped: Schedule[] = [];

        projectScheds.forEach((s) => {
          if (s.category && s.category.trim() !== '') {
            const categoryKey = `${projectName}|${s.category}`;
            if (!categorySchedules.has(categoryKey)) {
              categorySchedules.set(categoryKey, []);
            }
            categorySchedules.get(categoryKey)!.push(s);
          } else {
            projectUngrouped.push(s);
          }
        });

        // Sort categories by displayOrder
        const sortedCategories = Array.from(categorySchedules.keys()).sort((a, b) => {
          const orderA = getMinDisplayOrder(categorySchedules.get(a)!);
          const orderB = getMinDisplayOrder(categorySchedules.get(b)!);
          return orderA - orderB;
        });

        sortedCategories.forEach((categoryKey) => {
          const categoryScheds = categorySchedules.get(categoryKey)!;
          const categoryName = categoryKey.split('|')[1];

          // Save category-task mapping (for drag and drop)
          // Task ID list sorted by displayOrder
          const sortedIds = [...categoryScheds]
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map(s => s.id);
          categoryTasksMap.set(categoryKey, sortedIds);

          // Collapse state: if in Set, collapsed; if not, expanded
          const isCategoryExpanded = !expandedCategories.has(categoryKey);

          // Add category Task (transparent bar)
          const categoryTask = createCategoryTask(
            categoryKey,
            categoryName,
            categoryScheds,
            isCategoryExpanded,
            projectId
          );
          result.push(categoryTask);

          // Only add child Tasks if category is expanded (sorted by displayOrder)
          if (isCategoryExpanded) {
            const sortedCategoryScheds = [...categoryScheds].sort(
              (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
            );
            sortedCategoryScheds.forEach((s) => {
              result.push(scheduleToGanttTask(s, categoryKey));
            });
          }
        });

        // Add ungrouped schedules within project (sorted by displayOrder)
        const sortedProjectUngrouped = [...projectUngrouped].sort(
          (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        sortedProjectUngrouped.forEach((s) => {
          result.push(scheduleToGanttTask(s, projectId));
        });
      }
    });

    // Add schedules not belonging to any project (sorted by displayOrder)
    const sortedUngrouped = [...ungroupedSchedules].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    sortedUngrouped.forEach((s) => {
      result.push(scheduleToGanttTask(s));
    });

    return result;
  }, [schedules, expandedProjects, expandedCategories]);

  // Chart area header alignment (all view modes)
  // Set chartArea paddingTop to 0 to align with task list header
  useEffect(() => {
    if (tasks.length === 0) return;

    const alignChartHeader = () => {
      const container = containerRef.current;
      if (!container) return;

      const chartArea = container.querySelector('._CZjuD') as HTMLElement;
      if (chartArea) {
        // Use !important to override CSS rules
        chartArea.style.setProperty('padding-top', '0', 'important');
      }
    };

    // Apply after rendering (after library creates DOM)
    const timerId = setTimeout(alignChartHeader, 100);
    return () => clearTimeout(timerId);
  }, [tasks, viewMode]);

  // Weekly view only: scale SVG chart to fit available width after rendering
  useEffect(() => {
    if (viewMode !== ViewMode.Week || tasks.length === 0) {
      return;
    }

    const scaleChartToFit = () => {
      const container = containerRef.current;
      if (!container) return;

      // Structure: .gantt-wrapper > div > div._3eULf > div._CZjuD (chart area) > svg
      const mainContainer = container.querySelector('._3eULf') as HTMLElement;
      if (!mainContainer) return;

      // Chart area (._CZjuD, second child)
      const chartArea = mainContainer.children[1] as HTMLElement;
      if (!chartArea) return;

      const containerWidth = container.clientWidth;
      const taskListWidth = (mainContainer.children[0] as HTMLElement)?.getBoundingClientRect().width || GRID_WIDTH;
      const scrollbarWidth = (mainContainer.children[2] as HTMLElement)?.getBoundingClientRect().width || 16;

      // Calculate available chart width
      const availableChartWidth = containerWidth - WRAPPER_PADDING - taskListWidth - scrollbarWidth;
      const currentChartWidth = chartArea.getBoundingClientRect().width;

      // Scale if chart width differs from available width (zoom in or out)
      if (currentChartWidth > 0 && Math.abs(currentChartWidth - availableChartWidth) > 5) {
        const scaleX = availableChartWidth / currentChartWidth;
        // Scale within 0.8~1.5 range (prevent too large changes)
        if (scaleX > 0.8 && scaleX < 1.5) {
          chartArea.style.transformOrigin = 'left top';
          chartArea.style.transform = `scaleX(${scaleX})`;
        }
      }
    };

    // Apply scale after rendering
    const timerId = setTimeout(scaleChartToFit, 150);
    return () => {
      clearTimeout(timerId);
      // cleanup: remove transform
      const container = containerRef.current;
      const chartArea = container?.querySelector('._3eULf')?.children[1] as HTMLElement;
      if (chartArea) {
        chartArea.style.transform = '';
      }
    };
  }, [viewMode, tasks, columnWidth]);

  // Initial dynamic columnWidth calculation
  useEffect(() => {
    const updateColumnWidth = () => {
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
      const timeUnits = getTimeUnitsCount(schedules, viewMode);
      const newWidth = calculateColumnWidth(containerWidth, timeUnits, viewMode);
      setColumnWidth(newWidth);
    };

    updateColumnWidth();

    // Resize event listener
    const handleResize = () => {
      updateColumnWidth();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [schedules, viewMode]);

  // Weekly view: Convert W01~W52 → "WX" format (Monday-based week of month)
  useEffect(() => {
    if (viewMode !== ViewMode.Week) return;

    const convertWeekHeaders = () => {
      const container = containerRef.current;
      if (!container) return;

      const textElements = container.querySelectorAll('svg text');
      const currentYear = new Date().getFullYear();

      textElements.forEach((el) => {
        const text = el.textContent || '';
        // Match W01, W02 pattern
        const weekMatch = text.match(/^W(\d{2})$/);
        if (weekMatch) {
          const weekNum = parseInt(weekMatch[1], 10);
          const { weekOfMonth } = getMonthWeek(weekNum, currentYear);
          el.textContent = `W${weekOfMonth}`;
        }
      });
    };

    const timerId = setTimeout(convertWeekHeaders, 200);
    return () => clearTimeout(timerId);
  }, [viewMode, tasks, columnWidth]);

  // Daily view: Date format conversion (Thu, 26 → 26(Thu)) and weekend/holiday red highlighting
  // MutationObserver ensures newly appearing elements during scroll are also formatted
  useEffect(() => {
    if (viewMode !== ViewMode.Day) return;

    const container = containerRef.current;
    if (!container) return;

    // Extract base date range from schedules
    if (schedules.length > 0) {
      const dates = schedules.map((s) => parseLocalDate(s.startDate)).filter((d) => !isNaN(d.getTime()));
      if (dates.length > 0) {
        // base date used for context (no-op in English mode)
        new Date(Math.min(...dates.map((d) => d.getTime())));
      }
    }

    // Single text element formatting function
    const formatTextElement = (el: Element) => {
      const text = el.textContent || '';

      // Check if already converted (prevent duplicate conversion)
      if (text.match(/^\d{1,2}\([A-Z][a-z]{2}\)$/)) return;

      // English pattern: "Thu, 26"
      const engMatch = text.match(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s*(\d{1,2})$/);

      if (engMatch) {
        const dayEng = DAY_MAP[engMatch[1]];
        const dayNum = engMatch[2];
        el.textContent = `${dayNum}(${dayEng})`;

        // Weekend check
        if (dayEng === 'Sat' || dayEng === 'Sun') {
          (el as SVGElement).style.cssText = 'fill: #E53935 !important; font-weight: bold !important;';
        }
      }
    };

    // Format all text elements
    const formatAllTextElements = () => {
      const svg = container.querySelector('svg');
      if (!svg) return;
      const textElements = svg.querySelectorAll('text');
      textElements.forEach(formatTextElement);
    };

    // Initial formatting
    const timerId = setTimeout(formatAllTextElements, 200);

    // MutationObserver to detect DOM changes (new elements rendered on scroll)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Process newly added nodes
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'text') {
              formatTextElement(element);
            }
            // Also process text elements inside added nodes
            element.querySelectorAll?.('text')?.forEach(formatTextElement);
          }
        });
        // Also process when text content changes
        if (mutation.type === 'characterData' && mutation.target.parentElement?.tagName === 'text') {
          formatTextElement(mutation.target.parentElement);
        }
      });
    });

    // Start observing SVG area
    const svg = container.querySelector('svg');
    if (svg) {
      observer.observe(svg, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    // Re-apply formatting on scroll events (debounced)
    let scrollTimer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(formatAllTextElements, 100);
    };

    // Add event listeners to all scrollable areas
    const scrollableElements = container.querySelectorAll('[class*="_2k9Ys"], [class*="_3eULf"]');
    scrollableElements.forEach((el) => {
      el.addEventListener('scroll', handleScroll);
    });

    return () => {
      clearTimeout(timerId);
      clearTimeout(scrollTimer);
      observer.disconnect();
      scrollableElements.forEach((el) => {
        el.removeEventListener('scroll', handleScroll);
      });
    };
  }, [viewMode, tasks, columnWidth, schedules]);

  // Header SVG and scroll synchronization (gantt-task-react library bug fix)
  // Method: Clone header SVG as fixed overlay, hide original
  useEffect(() => {
    const container = containerRef.current;
    if (!container || tasks.length === 0) return;

    let scrollArea: HTMLElement | null = null;
    let clonedSvg: SVGSVGElement | null = null;
    let overlay: HTMLDivElement | null = null;
    let scrollbarOverlay: HTMLDivElement | null = null;
    let mutationObserver: MutationObserver | null = null;
    let verticalScrollHandler: (() => void) | null = null;
    let scrollbarSyncHandler: (() => void) | null = null;

    const setupHeaderSync = () => {
      scrollArea = container.querySelector('._2k9Ys') as HTMLElement;
      const chartArea = container.querySelector('._CZjuD') as HTMLElement;
      const originalHeaderSvg = chartArea?.querySelector(':scope > svg') as SVGSVGElement;

      if (!scrollArea || !chartArea || !originalHeaderSvg) return;

      const existingOverlay = container.querySelector('.header-overlay');
      if (existingOverlay) existingOverlay.remove();

      clonedSvg = originalHeaderSvg.cloneNode(true) as SVGSVGElement;
      originalHeaderSvg.style.visibility = 'hidden';

      let headerTop = 0;
      const taskListHeader = container.querySelector('._3_ygE') as HTMLElement;
      if (taskListHeader) {
        headerTop = taskListHeader.getBoundingClientRect().top - container.getBoundingClientRect().top;
      } else {
        const chartSvg = chartArea.querySelector('svg');
        if (chartSvg) {
          headerTop = chartSvg.getBoundingClientRect().top - container.getBoundingClientRect().top;
        } else {
          const containerStyle = window.getComputedStyle(container);
          headerTop = parseFloat(containerStyle.paddingTop) || 16;
        }
      }

      // Position overlay based on original header SVG location (maintain internal content alignment)
      overlay = document.createElement('div');
      overlay.className = 'header-overlay';

      const containerRect = container.getBoundingClientRect();
      const currentScrollLeft = scrollArea.scrollLeft;

      // Find Bar SVG to calculate scale and position
      let barSvgRenderWidth = 0;
      let barSvgLeftRelative = 0;
      const allSvgsForPosition = container.querySelectorAll('svg');
      for (const svg of allSvgsForPosition) {
        const height = parseInt(svg.getAttribute('height') || '0', 10);
        if (height > 100) {
          const barSvgRect = svg.getBoundingClientRect();
          barSvgRenderWidth = barSvgRect.width;
          barSvgLeftRelative = barSvgRect.left - containerRect.left;
          break;
        }
      }

      // Calculate scale from original header SVG attribute width
      const svgAttrWidth = parseFloat(clonedSvg.getAttribute('width') || '1000');
      const scrollScale = barSvgRenderWidth > 0 && svgAttrWidth > 0
        ? barSvgRenderWidth / svgAttrWidth
        : 1;

      // Calculate overlay position based on Bar SVG (using scaled scroll)
      const scaledScrollLeft = currentScrollLeft * scrollScale;
      const alignedOverlayLeft = barSvgLeftRelative + scaledScrollLeft;

      overlay.style.cssText = `
        position: absolute;
        top: ${headerTop}px;
        left: ${alignedOverlayLeft}px;
        width: ${chartArea.clientWidth}px;
        height: 50px;
        overflow: hidden;
        z-index: 100;
        background: white;
        pointer-events: none;
      `;

      // Match cloned SVG rendering size to Bar SVG (scale alignment)
      // Add viewBox to apply same scaling method
      // svgAttrWidth already calculated above
      const svgAttrHeight = parseFloat(clonedSvg.getAttribute('height') || '50');

      // Add viewBox if not present (so SVG scales uniformly to CSS size)
      if (!clonedSvg.getAttribute('viewBox')) {
        clonedSvg.setAttribute('viewBox', `0 0 ${svgAttrWidth} ${svgAttrHeight}`);
      }

      clonedSvg.style.cssText = `
        display: block;
        width: ${barSvgRenderWidth > 0 ? barSvgRenderWidth : svgAttrWidth}px;
        height: ${svgAttrHeight}px;
        transform: translateX(0);
        transform-origin: left top;
        transition: none;
      `;

      // Weekly view: Add weekly divider lines to header + adjust text positions
      // Draw dividers based on columnWidth - no vertical lines in month area
      if (viewMode === ViewMode.Week) {
        const svgHeight = parseFloat(clonedSvg.getAttribute('height') || '50');
        const svgWidth = parseFloat(clonedSvg.getAttribute('width') || '1000');
        const monthRowHeight = 25;

        // Move week text to column center (to avoid overlapping with dividers)
        const texts = clonedSvg.querySelectorAll('text');
        texts.forEach(text => {
          const content = text.textContent || '';
          // Move only week text (W1, W2, W3, W4, W5)
          if (/^W\d$/.test(content)) {
            const currentX = parseFloat(text.getAttribute('x') || '0');
            // Move text to column center (by columnWidth/2)
            text.setAttribute('x', String(currentX + columnWidth / 2));
            // Center-align text
            text.setAttribute('text-anchor', 'middle');
          }
        });

        // Create divider line group
        const dividerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        dividerGroup.setAttribute('class', 'header-dividers');

        // Month-week boundary line (horizontal)
        const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        horizontalLine.setAttribute('x1', '0');
        horizontalLine.setAttribute('y1', String(monthRowHeight));
        horizontalLine.setAttribute('x2', String(svgWidth));
        horizontalLine.setAttribute('y2', String(monthRowHeight));
        horizontalLine.setAttribute('stroke', '#e0e0e0');
        horizontalLine.setAttribute('stroke-width', '1');
        dividerGroup.appendChild(horizontalLine);

        // Use actual grid line x-coordinates from Bar area (prevent cumulative errors)
        const barGridXPositions: number[] = [];
        let foundBarSvg: SVGSVGElement | null = null;

        const allSvgsInContainer = container.querySelectorAll('svg');
        for (const svg of allSvgsInContainer) {
          const height = parseInt(svg.getAttribute('height') || '0', 10);
          if (height > 100) {
            foundBarSvg = svg as SVGSVGElement;
            break;
          }
        }

        if (foundBarSvg) {
          // Extract vertical grid line x-coordinates from Bar area
          foundBarSvg.querySelectorAll('line').forEach(line => {
            const x1 = parseFloat(line.getAttribute('x1') || '0');
            const x2 = parseFloat(line.getAttribute('x2') || '0');
            const y2 = parseFloat(line.getAttribute('y2') || '0');
            // Vertical grid line: x1 == x2, large height
            if (Math.abs(x1 - x2) < 0.5 && y2 > 50 && x1 > 0) {
              barGridXPositions.push(x1);
            }
          });
        }

        // Draw weekly divider lines - apply offset correction at Bar grid positions
        // Remove duplicates and sort
        const uniqueGridX = [...new Set(barGridXPositions)].sort((a, b) => a - b);

        uniqueGridX.forEach(lineX => {
          // Use Bar grid x-coordinates directly (overlay is aligned with Bar SVG)
          const weekLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          weekLine.setAttribute('x1', String(lineX));
          weekLine.setAttribute('y1', String(monthRowHeight)); // Week row start (y=25)
          weekLine.setAttribute('x2', String(lineX));
          weekLine.setAttribute('y2', String(svgHeight)); // Week row end (y=50)
          weekLine.setAttribute('stroke', '#e0e0e0');
          weekLine.setAttribute('stroke-width', '1');
          dividerGroup.appendChild(weekLine);
        });

        clonedSvg.appendChild(dividerGroup);
      }

      overlay.appendChild(clonedSvg);
      container.style.position = 'relative';
      container.appendChild(overlay);

      // =====================================================
      // Custom horizontal scrollbar overlay (fixed at top)
      // =====================================================
      const existingScrollbar = container.querySelector('.scrollbar-overlay');
      if (existingScrollbar) existingScrollbar.remove();

      scrollbarOverlay = document.createElement('div');
      scrollbarOverlay.className = 'scrollbar-overlay';

      const scrollbarTrack = document.createElement('div');
      scrollbarTrack.className = 'scrollbar-track';

      const scrollbarThumb = document.createElement('div');
      scrollbarThumb.className = 'scrollbar-thumb';

      scrollbarTrack.appendChild(scrollbarThumb);
      scrollbarOverlay.appendChild(scrollbarTrack);

      // Calculate exact left position of chart area
      const chartAreaRect = chartArea.getBoundingClientRect();
      const chartAreaLeft = chartAreaRect.left - containerRect.left;

      // Scrollbar position: just above date header (headerTop - scrollbarHeight for spacing)
      const scrollbarHeight = 16; // Scrollbar area height
      const scrollbarTop = headerTop - scrollbarHeight - 2; // 2px gap from date area

      scrollbarOverlay.style.cssText = `
        position: absolute;
        top: ${scrollbarTop}px;
        left: ${chartAreaLeft}px;
        width: ${chartArea.clientWidth}px;
        height: ${scrollbarHeight}px;
        z-index: 101;
      `;

      container.appendChild(scrollbarOverlay);

      // Calculate scrollbar thumb size and position
      const updateScrollbarThumb = () => {
        if (!scrollArea || !scrollbarThumb || !scrollbarTrack) return;

        const scrollWidth = scrollArea.scrollWidth;
        const clientWidth = scrollArea.clientWidth;
        const trackWidth = scrollbarTrack.clientWidth - 8; // account for margin

        // Thumb width = (visible area / total content) * track width
        const thumbWidth = Math.max(40, (clientWidth / scrollWidth) * trackWidth);
        scrollbarThumb.style.width = `${thumbWidth}px`;

        // Thumb position = (scroll position / scrollable range) * (track width - thumb width)
        const scrollableRange = scrollWidth - clientWidth;
        const thumbRange = trackWidth - thumbWidth;
        const thumbLeft = scrollableRange > 0
          ? (scrollArea.scrollLeft / scrollableRange) * thumbRange
          : 0;
        scrollbarThumb.style.left = `${thumbLeft}px`;
      };

      // Scrollbar drag logic
      let isDragging = false;
      let startX = 0;
      let startScrollLeft = 0;

      const onMouseDown = (e: MouseEvent) => {
        if (!scrollArea) return;
        isDragging = true;
        startX = e.clientX;
        startScrollLeft = scrollArea.scrollLeft;
        scrollbarThumb.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging || !scrollArea || !scrollbarTrack) return;

        const trackWidth = scrollbarTrack.clientWidth - 8;
        const thumbWidth = scrollbarThumb.clientWidth;
        const thumbRange = trackWidth - thumbWidth;

        const deltaX = e.clientX - startX;
        const scrollableRange = scrollArea.scrollWidth - scrollArea.clientWidth;

        // Convert mouse movement to scroll movement
        const scrollDelta = thumbRange > 0
          ? (deltaX / thumbRange) * scrollableRange
          : 0;

        scrollArea.scrollLeft = startScrollLeft + scrollDelta;
      };

      const onMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          scrollbarThumb.classList.remove('dragging');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      };

      // Jump to position on track click
      const onTrackClick = (e: MouseEvent) => {
        if (!scrollArea || !scrollbarTrack || e.target === scrollbarThumb) return;

        const trackRect = scrollbarTrack.getBoundingClientRect();
        const clickX = e.clientX - trackRect.left;
        const trackWidth = scrollbarTrack.clientWidth - 8;
        const thumbWidth = scrollbarThumb.clientWidth;

        // Convert click position to scroll position
        const scrollableRange = scrollArea.scrollWidth - scrollArea.clientWidth;
        const targetScrollLeft = ((clickX - thumbWidth / 2) / (trackWidth - thumbWidth)) * scrollableRange;

        scrollArea.scrollLeft = Math.max(0, Math.min(scrollableRange, targetScrollLeft));
      };

      scrollbarThumb.addEventListener('mousedown', onMouseDown);
      scrollbarTrack.addEventListener('click', onTrackClick);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      // Scroll area → scrollbar thumb synchronization
      scrollbarSyncHandler = updateScrollbarThumb;
      scrollArea.addEventListener('scroll', updateScrollbarThumb);
      updateScrollbarThumb();

      // scrollScale already calculated above

      const syncScroll = () => {
        if (clonedSvg && scrollArea) {
          // Apply viewBox scale ratio to exactly match Bar area scroll
          const scaledScrollLeft = scrollArea.scrollLeft * scrollScale;
          clonedSvg.style.transform = `translateX(-${scaledScrollLeft}px)`;
        }
      };

      scrollArea.addEventListener('scroll', syncScroll);
      syncScroll();

      // Vertical scroll sync - update overlay top based on container(.gantt-wrapper) scroll
      // Maintain headerTop offset to align with task list header
      verticalScrollHandler = () => {
        if (container) {
          const scrollTop = container.scrollTop;
          if (overlay) {
            overlay.style.top = `${headerTop + scrollTop}px`;
          }
          // Move scrollbar overlay as well
          if (scrollbarOverlay) {
            scrollbarOverlay.style.top = `${scrollbarTop + scrollTop}px`;
          }
        }
      };
      container.addEventListener('scroll', verticalScrollHandler);
      verticalScrollHandler();

      mutationObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target as SVGSVGElement;
            if (target.tagName === 'svg' && target.style.visibility !== 'hidden') {
              target.style.visibility = 'hidden';
            }
          }
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const newHeaderSvg = chartArea.querySelector(':scope > svg') as SVGSVGElement;
            if (newHeaderSvg && newHeaderSvg.style.visibility !== 'hidden') {
              setTimeout(setupHeaderSync, 50);
              return;
            }
          }
        }
      });

      mutationObserver.observe(chartArea, {
        attributes: true,
        attributeFilter: ['style'],
        childList: true,
        subtree: true,
      });
    };

    const timerId = setTimeout(setupHeaderSync, 300);

    return () => {
      clearTimeout(timerId);
      if (mutationObserver) mutationObserver.disconnect();
      if (verticalScrollHandler && container) {
        container.removeEventListener('scroll', verticalScrollHandler);
      }
      if (scrollbarSyncHandler && scrollArea) {
        scrollArea.removeEventListener('scroll', scrollbarSyncHandler);
      }
      if (overlay) overlay.remove();
      if (scrollbarOverlay) scrollbarOverlay.remove();
    };
  }, [tasks, viewMode, columnWidth]);

  // Change bar text to start date (left outside) + end date (right outside)
  // Uses continuous polling for stable operation across viewMode changes, hover, etc.
  // Index-based matching handles multiple tasks with same dates accurately
  useEffect(() => {
    const container = containerRef.current;
    if (!container || tasks.length === 0) return;

    let pollingInterval: ReturnType<typeof setInterval> | null = null;

    const updateBarTexts = () => {
      // Find text in the second SVG (bar area)
      const svgs = container.querySelectorAll('svg');
      if (svgs.length < 2) return false;

      const barSvg = svgs[1] as SVGSVGElement;

      // Unified g.bar > g approach (most stable)
      // gantt-task-react always creates per-task g elements inside g.bar
      const barG = barSvg.querySelector('g.bar');
      if (!barG) return false;

      const gElements = barG.querySelectorAll(':scope > g');
      if (gElements.length === 0) return false;

      // Convert to array of g elements
      const gArray = Array.from(gElements);

      gArray.forEach((gEl, index) => {
        // Find text element within this g element (excluding end-date-label)
        const textEl = gEl.querySelector('text:not(.end-date-label)');
        if (!textEl) return;

        // Match task by index (most reliable method)
        // gArray and tasks array are rendered in the same order
        const matchedTask = tasks[index];
        if (!matchedTask) return;

        // Hide text for category (project type)
        if (matchedTask.type === 'project') {
          textEl.setAttribute('style', 'display: none;');
          // Also remove existing end date label
          const existingEndText = gEl.querySelector('.end-date-label');
          if (existingEndText) {
            existingEndText.remove();
          }
          return;
        }

        // Find main bar from sibling rects (widest rect with color)
        const rects = gEl.querySelectorAll('rect');
        let barRect: SVGRectElement | null = null;
        let maxWidth = 0;

        rects.forEach((rect) => {
          const fill = rect.getAttribute('fill') || '';
          const w = parseFloat(rect.getAttribute('width') || '0');
          const h = parseFloat(rect.getAttribute('height') || '0');

          if (h > 35) return; // Exclude background
          if (w < 5 || h < 5) return; // Exclude too small
          if (fill === 'transparent' || fill === 'none' || fill === '' || fill === null) return;

          if (w > maxWidth) {
            maxWidth = w;
            barRect = rect;
          }
        });

        if (!barRect || maxWidth === 0) return;

        const validRect = barRect as SVGRectElement;
        const barX = parseFloat(validRect.getAttribute('x') || '0');
        const barY = parseFloat(validRect.getAttribute('y') || '0');
        const barHeight = parseFloat(validRect.getAttribute('height') || '0');

        // Start/end date format (M.D format)
        const startDate = matchedTask.start;
        const endDate = matchedTask.end;
        const startFormatted = `${startDate.getMonth() + 1}.${startDate.getDate()}`;
        const endFormatted = `${endDate.getMonth() + 1}.${endDate.getDate()}`;

        const textY = barY + barHeight / 2 + 4; // Vertical center
        const expectedStartX = String(barX - 8);

        // Start date (left outside bar) - always update for consistency
        textEl.textContent = startFormatted;
        textEl.setAttribute('text-anchor', 'end'); // Right-align (text end at x position)
        textEl.setAttribute('x', expectedStartX); // 8px outside bar left
        textEl.setAttribute('y', String(textY));
        // Remove CSS class and apply inline styles (override library CSS)
        textEl.removeAttribute('class');
        textEl.setAttribute('style', 'fill: #555 !important; font-size: 11px; font-weight: 500;');

        // Add/update end date text (right outside bar)
        const expectedEndX = String(barX + maxWidth + 8);
        const existingEndText = gEl.querySelector('.end-date-label');
        if (!existingEndText) {
          const endTextEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          endTextEl.textContent = endFormatted;
          endTextEl.setAttribute('class', 'end-date-label');
          endTextEl.setAttribute('text-anchor', 'start'); // Left-align
          endTextEl.setAttribute('x', expectedEndX); // 8px outside bar right
          endTextEl.setAttribute('y', String(textY));
          endTextEl.setAttribute('fill', '#555');
          endTextEl.setAttribute('font-size', '11');
          endTextEl.setAttribute('font-weight', '500');
          gEl.appendChild(endTextEl);
        } else {
          // Update existing end date
          existingEndText.textContent = endFormatted;
          existingEndText.setAttribute('x', expectedEndX);
          existingEndText.setAttribute('y', String(textY));
        }
      });

      return gArray.length > 0;
    };

    // Update after initial rendering
    const initialDelay = setTimeout(() => {
      updateBarTexts();
    }, 150);

    // Continuous polling (150ms interval)
    // Keep running to handle hover, viewMode changes, etc.
    pollingInterval = setInterval(() => {
      updateBarTexts();
    }, 150);

    return () => {
      clearTimeout(initialDelay);
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [tasks, viewMode, columnWidth]);

  // Task click handler (ignore clicks on categories)
  const handleClick = (task: Task) => {
    // Don't open edit modal for categories (project type)
    if (task.type === 'project') return;

    const schedule = schedules.find((s) => s.id === task.id);
    if (schedule) {
      onTaskClick(schedule);
    }
  };

  // Task date change handler (ignore drag on categories)
  const handleDateChange = (task: Task) => {
    // Cannot drag-change categories (project type)
    if (task.type === 'project') return false;

    const schedule = schedules.find((s) => s.id === task.id);
    if (schedule) {
      const ganttTask: GanttTask = {
        id: task.id,
        name: task.name,
        start: task.start,
        end: task.end,
        progress: task.progress,
        type: 'task',
        dependencies: schedule.dependencies,
        project: schedule.project,
      };
      onTaskChange(ganttTask, schedule);
    }
    return true;
  };

  // Progress change handler (ignore drag on categories)
  const handleProgressChange = (task: Task) => {
    // Cannot change progress on categories (project type)
    if (task.type === 'project') return false;

    const schedule = schedules.find((s) => s.id === task.id);
    if (schedule) {
      const ganttTask: GanttTask = {
        id: task.id,
        name: task.name,
        start: task.start,
        end: task.end,
        progress: task.progress,
        type: 'task',
        dependencies: schedule.dependencies,
        project: schedule.project,
      };
      onTaskChange(ganttTask, schedule);
    }
    return true;
  };

  // Draw dependency lines (on hover) - using data-task-id attribute
  useEffect(() => {
    const container = containerRef.current;
    if (!container || tasks.length === 0) return;

    const drawDependencyLines = () => {
      // Remove existing connection lines
      container.querySelectorAll('.dependency-line').forEach(el => el.remove());

      if (!hoveredTaskId) return;

      // Find schedule of hovered task
      const hoveredSchedule = schedules.find(s => s.id === hoveredTaskId);
      if (!hoveredSchedule) return;

      // Find bar area SVG
      const svgs = container.querySelectorAll('svg');
      let barSvg: SVGSVGElement | null = null;
      for (const svg of svgs) {
        const height = parseInt(svg.getAttribute('height') || '0', 10);
        if (height > 100) {
          barSvg = svg as SVGSVGElement;
          break;
        }
      }
      if (!barSvg) return;

      // Find bar position (unified g.bar > g index-based approach)
      const getBarPosition = (taskId: string): { x: number; y: number; width: number; height: number } | null => {
        // Find index in tasks array
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return null;

        // Element at the given index among g.bar > g elements
        const barG = barSvg!.querySelector('g.bar');
        if (!barG) return null;

        const gElements = barG.querySelectorAll(':scope > g');
        const gElement = gElements[taskIndex];
        if (!gElement) return null;

        const rects = gElement.querySelectorAll('rect');
        if (rects.length === 0) return null;

        // Find actual bar rect: smallest non-transparent rect with fill
        // (to find actual bar, not progress bar)
        let barRect: SVGRectElement | null = null;
        let barWidth = Infinity;

        rects.forEach((rect) => {
          const fill = rect.getAttribute('fill') || '';
          const w = parseFloat(rect.getAttribute('width') || '0');
          const h = parseFloat(rect.getAttribute('height') || '0');

          // Exclude background rect (height similar to full row height)
          if (h > 35) return;
          // Exclude too small rect
          if (w < 5 || h < 5) return;
          // Exclude transparent rect
          if (fill === 'transparent' || fill === 'none' || fill === '') return;

          // Select rect with smallest width (progress bar = actual bar)
          // Progress bar overlaps actual bar, so same position
          if (w < barWidth) {
            barWidth = w;
            barRect = rect;
          }
        });

        // If progress bar not found, use largest rect (fallback)
        if (!barRect) {
          let maxWidth = 0;
          rects.forEach((rect) => {
            const w = parseFloat(rect.getAttribute('width') || '0');
            const h = parseFloat(rect.getAttribute('height') || '0');
            if (h > 35) return; // Exclude background
            if (w > maxWidth) {
              maxWidth = w;
              barRect = rect;
            }
          });
          barWidth = maxWidth;
        }

        if (!barRect || barWidth === 0 || barWidth === Infinity) return null;

        const validRect = barRect as SVGRectElement;
        return {
          x: parseFloat(validRect.getAttribute('x') || '0'),
          y: parseFloat(validRect.getAttribute('y') || '0'),
          width: barWidth,
          height: parseFloat(validRect.getAttribute('height') || '0'),
        };
      };

      // Get actual position of hovered bar
      const hoveredPos = getBarPosition(hoveredTaskId);
      if (!hoveredPos) return;

      // Add arrow marker (once only)
      if (!barSvg.querySelector('#arrowhead')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#667eea" />
          </marker>
          <marker id="arrowhead-succ" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
          </marker>
        `;
        barSvg.appendChild(defs);
      }

      // Draw predecessor dependency lines - blue
      const predecessors = hoveredSchedule.dependencies || [];
      predecessors.forEach(predId => {
        const predPos = getBarPosition(predId);
        if (!predPos) return;

        // Predecessor bar end → current bar start
        const predEndX = predPos.x + predPos.width;  // End of predecessor bar
        const predCenterY = predPos.y + predPos.height / 2;  // Center of predecessor bar
        const hoveredStartX = hoveredPos.x;  // Start of current bar
        const hoveredCenterY = hoveredPos.y + hoveredPos.height / 2;  // Center of current bar

        // Angled line path (predecessor end → midpoint → current start)
        const gapX = 10; // Gap between bar and line
        const midX = predEndX + (hoveredStartX - predEndX) / 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'dependency-line');

        // Angled line: predecessor end → gap right → vertical move → current start
        const d = `M ${predEndX + gapX} ${predCenterY} ` +
                  `L ${midX} ${predCenterY} ` +
                  `L ${midX} ${hoveredCenterY} ` +
                  `L ${hoveredStartX - gapX} ${hoveredCenterY}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#667eea');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '6,4');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');

        barSvg.appendChild(path);
      });

      // Draw successor dependency lines - orange
      const successors = schedules.filter(s => s.dependencies?.includes(hoveredTaskId));
      successors.forEach(succSchedule => {
        const succPos = getBarPosition(succSchedule.id);
        if (!succPos) return;

        // Current bar end → successor bar start
        const hoveredEndX = hoveredPos.x + hoveredPos.width;  // End of current bar
        const hoveredCenterY = hoveredPos.y + hoveredPos.height / 2;
        const succStartX = succPos.x;  // Start of successor bar
        const succCenterY = succPos.y + succPos.height / 2;

        const gapX = 10;
        const midX = hoveredEndX + (succStartX - hoveredEndX) / 2;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'dependency-line');

        const d = `M ${hoveredEndX + gapX} ${hoveredCenterY} ` +
                  `L ${midX} ${hoveredCenterY} ` +
                  `L ${midX} ${succCenterY} ` +
                  `L ${succStartX - gapX} ${succCenterY}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#f59e0b');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', '6,4');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead-succ)');

        barSvg.appendChild(path);
      });
    };

    const timerId = setTimeout(drawDependencyLines, 150);
    return () => clearTimeout(timerId);
  }, [hoveredTaskId, tasks, schedules]);

  // Add hover event listeners to bar elements
  useEffect(() => {
    const container = containerRef.current;
    if (!container || tasks.length === 0) return;

    const addHoverListeners = () => {
      // Add events to rect elements in bar area SVG
      const svgs = container.querySelectorAll('svg');
      let barSvg: SVGSVGElement | null = null;
      for (const svg of svgs) {
        const height = parseInt(svg.getAttribute('height') || '0', 10);
        if (height > 100) {
          barSvg = svg as SVGSVGElement;
          break;
        }
      }
      if (!barSvg) return;

      // Create task ID → schedule mapping
      const taskIdToSchedule = new Map<string, Schedule>();
      schedules.forEach(s => taskIdToSchedule.set(s.id, s));

      // Match task row by bar element's y coordinate
      // tasks array is sorted in display order
      const rowHeight = 40;

      // Iterate all g elements to find bar rects
      const gElements = barSvg.querySelectorAll('g');
      gElements.forEach((g) => {
        // Skip already processed elements
        if (g.getAttribute('data-hover-attached')) return;

        // Find bar rects - select actual bar rect from multiple rects
        const rects = g.querySelectorAll('rect');
        if (rects.length === 0) return;

        // Select rect with largest width as main bar (exclude progress overlay)
        let mainRect: SVGRectElement | null = null;
        let maxWidth = 0;
        const svgWidth = barSvg?.clientWidth || 1000;

        rects.forEach((rect) => {
          const w = parseFloat(rect.getAttribute('width') || '0');
          // Exclude background rect (90%+ of total width)
          if (w > svgWidth * 0.9) return;
          // Select rect with largest width
          if (w > maxWidth) {
            maxWidth = w;
            mainRect = rect;
          }
        });

        if (!mainRect || maxWidth === 0) return;

        const validMainRect = mainRect as SVGRectElement;
        // Match task row by y coordinate
        const rectY = parseFloat(validMainRect.getAttribute('y') || '0');
        const taskIndex = Math.floor(rectY / rowHeight);

        // Check if valid task
        if (taskIndex < 0 || taskIndex >= tasks.length) return;
        const task = tasks[taskIndex];
        if (!task || task.type === 'project') return;

        // Check if schedule exists
        const schedule = taskIdToSchedule.get(task.id);
        if (!schedule) return;

        g.setAttribute('data-hover-attached', 'true');
        g.setAttribute('data-task-id', task.id);
        g.style.cursor = 'pointer';

        // Cache bar position (store actual rect coordinates) - use main bar's full width
        const rectX = parseFloat(validMainRect.getAttribute('x') || '0');
        const rectHeight = parseFloat(validMainRect.getAttribute('height') || '0');
        barPositionsRef.current.set(task.id, {
          x: rectX,
          y: rectY,
          width: maxWidth,  // Main bar's full width
          height: rectHeight,
        });

        g.addEventListener('mouseenter', () => {
          setHoveredTaskId(task.id);
        });

        g.addEventListener('mouseleave', () => {
          setHoveredTaskId(null);
        });
      });
    };

    const timerId = setTimeout(addHoverListeners, 600);
    return () => clearTimeout(timerId);
  }, [tasks, schedules, viewMode]);

  if (tasks.length === 0) {
    return (
      <div className="gantt-empty">
        <p>No schedules to display.</p>
        <p>Add a new schedule to get started.</p>
      </div>
    );
  }

  return (
    <div className="gantt-wrapper" id="gantt-chart" ref={containerRef}>
      <Gantt
        key={`gantt-${columnWidth}-${viewMode}`}
        tasks={tasks}
        viewMode={viewMode}
        viewDate={viewDate}
        locale="en-US"
        columnWidth={columnWidth}
        listCellWidth="510px"
        rowHeight={40}
        barCornerRadius={4}
        todayColor="rgba(102, 126, 234, 0.1)"
        onClick={handleClick}
        onDateChange={handleDateChange}
        onProgressChange={handleProgressChange}
        onExpanderClick={handleExpanderClick}
        TooltipContent={TooltipContent}
        TaskListHeader={TaskListHeader}
        TaskListTable={({ tasks: tl }) => <TaskListTable tasks={tl} />}
      />
    </div>
  );
}
