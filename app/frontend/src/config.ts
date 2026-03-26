/**
 * SheetSchedule configuration
 * Customize these values to match your project
 */

export const APP_CONFIG = {
  productName: 'SheetSchedule',
  tagline: 'Google Sheets to Gantt Chart, Instantly',
  version: '1.0.0',
  statuses: ['Planned', 'In Progress', 'Completed', 'Delayed', 'TBD'] as const,
  defaultStatus: 'Planned' as const,
  colors: [
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
  ],
};
