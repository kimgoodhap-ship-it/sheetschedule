"""SheetSchedule backend configuration"""

# Schedule status values
SCHEDULE_STATUSES = ["Planned", "In Progress", "Completed", "Delayed", "TBD"]

# Default status for new schedules
DEFAULT_STATUS = "Planned"

# Google Sheets worksheet name
SCHEDULE_SHEET_NAME = "schedule"

# Schedule sheet column headers (must match your Google Sheet)
SCHEDULE_COLUMNS = [
    "ID", "Project", "Category", "Task", "Assignee",
    "Start Date", "End Date", "Dependencies", "Status", "Color", "Memo"
]

# Color mappings (hex <-> emoji for Google Sheets display)
COLOR_MAP = {
    '#F44336': '🔴 Red',
    '#FF9800': '🟠 Orange',
    '#FFEB3B': '🟡 Yellow',
    '#4CAF50': '🟢 Green',
    '#2196F3': '🔵 Blue',
    '#9C27B0': '🟣 Purple',
    '#E91E63': '🩷 Pink',
    '#03A9F4': '🩵 Sky',
    '#795548': '🤎 Brown',
    '#607D8B': '⚫ Gray',
}

# Default color
DEFAULT_COLOR = '#4CAF50'
DEFAULT_COLOR_EMOJI = '🟢 Green'
