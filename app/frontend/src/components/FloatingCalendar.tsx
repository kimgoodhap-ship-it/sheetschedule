/**
 * Floating calendar component
 * Shows selected month calendars at top right
 */

import { useMemo } from 'react';
import { isWeekend } from '../utils/koreanHolidays';

interface FloatingCalendarProps {
  visibleMonths: number[];
  onClose: (monthOffset: number) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function FloatingCalendar({
  visibleMonths,
  onClose,
}: FloatingCalendarProps) {
  const today = useMemo(() => new Date(), []);

  const getYearMonth = (absoluteOffset: number) => {
    const date = new Date(today.getFullYear(), today.getMonth() + absoluteOffset, 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date,
    };
  };

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDayClassName = (year: number, month: number, day: number | null) => {
    if (day === null) return 'calendar-day empty';

    const date = new Date(year, month - 1, day);
    const classes = ['calendar-day'];

    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      classes.push('today');
    }

    if (isWeekend(date)) {
      classes.push('weekend');
    }

    return classes.join(' ');
  };

  if (visibleMonths.length === 0) {
    return null;
  }

  const sortedMonths = [...visibleMonths].sort((a, b) => a - b);

  return (
    <div className="floating-calendar">
      <div className="calendar-months">
        {sortedMonths.map((offset) => {
          const { year, month } = getYearMonth(offset);
          const days = generateCalendarDays(year, month);

          return (
            <div key={offset} className="calendar-month">
              <div className="month-header">
                <span className="month-title">{MONTH_NAMES[month - 1]} {year}</span>
                <button
                  className="month-close-btn"
                  onClick={() => onClose(offset)}
                  title="Close"
                >
                  ×
                </button>
              </div>

              <div className="weekday-row">
                {WEEKDAYS.map((day, idx) => (
                  <span
                    key={day}
                    className={`weekday ${idx === 0 ? 'sunday' : idx === 6 ? 'saturday' : ''}`}
                  >
                    {day}
                  </span>
                ))}
              </div>

              <div className="days-grid">
                {days.map((day, idx) => (
                  <span
                    key={idx}
                    className={getDayClassName(year, month, day)}
                  >
                    {day || ''}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
