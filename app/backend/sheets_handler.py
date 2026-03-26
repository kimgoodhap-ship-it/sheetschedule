"""Google Sheets handler for SheetSchedule - Schedule sheet operations"""

import os
import json
import base64
from datetime import datetime
from typing import Optional

import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

# Schedule status values
SCHEDULE_STATUS_VALUES = ["Planned", "In Progress", "Completed", "Delayed", "TBD"]


class SheetsHandler:
    """Google Sheets handler for schedule operations"""

    def __init__(self):
        """Initialize - supports Base64, JSON string, and file-based credentials"""
        credentials_base64 = os.getenv("GOOGLE_CREDENTIALS_BASE64")
        credentials_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
        credentials_file = os.getenv("GOOGLE_CREDENTIALS_FILE")

        if credentials_base64:
            credentials_info = json.loads(base64.b64decode(credentials_base64))
            self.credentials = Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
        elif credentials_json:
            credentials_info = json.loads(credentials_json)
            self.credentials = Credentials.from_service_account_info(credentials_info, scopes=SCOPES)
        elif credentials_file:
            self.credentials = Credentials.from_service_account_file(credentials_file, scopes=SCOPES)
        else:
            raise ValueError("Google credentials not configured. Set GOOGLE_CREDENTIALS_BASE64, GOOGLE_CREDENTIALS_JSON, or GOOGLE_CREDENTIALS_FILE.")

        self.client = gspread.authorize(self.credentials)
        self.spreadsheet_id = os.getenv("GOOGLE_SPREADSHEET_ID")
        self._spreadsheet = None

    @property
    def spreadsheet(self):
        """Lazy-load spreadsheet object"""
        if self._spreadsheet is None:
            if not self.spreadsheet_id:
                raise ValueError("GOOGLE_SPREADSHEET_ID environment variable is not set.")
            self._spreadsheet = self.client.open_by_key(self.spreadsheet_id)
        return self._spreadsheet

    # ========== Schedule Methods ==========

    def _get_schedule_sheet(self):
        """Get schedule worksheet (create if not exists)"""
        try:
            return self.spreadsheet.worksheet("schedule")
        except gspread.exceptions.WorksheetNotFound:
            sheet = self.spreadsheet.add_worksheet(title="schedule", rows=100, cols=11)
            headers = ["ID", "Project", "Category", "Task", "Assignee", "Start Date", "End Date",
                      "Dependencies", "Status", "Color", "Memo"]
            sheet.update('A1:K1', [headers])
            return sheet

    def generate_schedule_id(self) -> str:
        """Generate a new schedule ID"""
        year = datetime.now().year

        try:
            schedule = self._get_schedule_sheet()
            all_ids = schedule.col_values(1)[1:]  # Skip header

            if not all_ids:
                return f"SCH-{year}-001"

            current_year_ids = [id for id in all_ids if f"SCH-{year}" in id]
            if not current_year_ids:
                return f"SCH-{year}-001"

            last_num = max(int(id.split("-")[-1]) for id in current_year_ids)
            return f"SCH-{year}-{last_num + 1:03d}"

        except Exception:
            return f"SCH-{year}-001"

    def get_all_schedules(self) -> list[dict]:
        """Get all schedules"""
        try:
            schedule = self._get_schedule_sheet()
            records = schedule.get_all_records()
            return records
        except Exception as e:
            print(f"Failed to fetch schedules: {e}")
            return []

    def get_schedules_by_project(self, project: str) -> list[dict]:
        """Get schedules filtered by project"""
        all_schedules = self.get_all_schedules()
        return [s for s in all_schedules if s.get("Project") == project]

    def get_schedule_by_id(self, schedule_id: str) -> Optional[dict]:
        """Get a single schedule by ID"""
        all_schedules = self.get_all_schedules()
        for schedule in all_schedules:
            if schedule.get("ID") == schedule_id:
                return schedule
        return None

    def add_schedule(self, project: str, name: str, start_date: str, end_date: str,
                    assignee: str = "", category: str = "", dependencies: str = "",
                    status: str = "Planned", color: str = "#4CAF50", memo: str = "") -> Optional[str]:
        """Add a new schedule"""
        try:
            schedule = self._get_schedule_sheet()
            schedule_id = self.generate_schedule_id()

            if status not in SCHEDULE_STATUS_VALUES:
                status = "Planned"

            # Column order: ID, Project, Category, Task, Assignee, Start Date, End Date, Dependencies, Status, Color, Memo
            row = [
                schedule_id,
                project,
                category,
                name,
                assignee,
                start_date,
                end_date,
                dependencies,
                status,
                color,
                memo
            ]

            schedule.append_row(row)
            return schedule_id

        except Exception as e:
            print(f"Failed to add schedule: {e}")
            return None

    def update_schedule(self, schedule_id: str, **kwargs) -> bool:
        """Update a schedule - batch update for performance"""
        try:
            schedule = self._get_schedule_sheet()
            headers = schedule.row_values(1)

            cell = schedule.find(schedule_id, in_column=1)
            if not cell:
                return False

            row = cell.row

            # Field mapping (API field name → Sheet column name)
            field_to_col = {
                "project": "Project",
                "category": "Category",
                "name": "Task",
                "assignee": "Assignee",
                "start_date": "Start Date",
                "end_date": "End Date",
                "dependencies": "Dependencies",
                "status": "Status",
                "color": "Color",
                "memo": "Memo",
            }

            cells_to_update = []

            for key, value in kwargs.items():
                col_name = field_to_col.get(key, key)
                if col_name in headers:
                    col_idx = headers.index(col_name) + 1
                    cells_to_update.append(gspread.Cell(row, col_idx, value))

            if cells_to_update:
                schedule.update_cells(cells_to_update)

            return True

        except Exception as e:
            print(f"Failed to update schedule: {e}")
            return False

    def delete_schedule(self, schedule_id: str) -> bool:
        """Delete a schedule"""
        try:
            schedule = self._get_schedule_sheet()
            cell = schedule.find(schedule_id, in_column=1)

            if not cell:
                return False

            schedule.delete_rows(cell.row)
            return True

        except Exception as e:
            print(f"Failed to delete schedule: {e}")
            return False

    def check_circular_dependency(self, schedule_id: str, new_dependencies: list[str]) -> bool:
        """Check for circular dependencies (True = cycle found)"""
        all_schedules = self.get_all_schedules()

        dep_graph = {}
        for s in all_schedules:
            sid = s.get("ID", "")
            deps_str = s.get("Dependencies", "")
            deps = [d.strip() for d in deps_str.split(",") if d.strip()] if deps_str else []
            dep_graph[sid] = deps

        dep_graph[schedule_id] = new_dependencies

        def has_cycle(node: str, visited: set, rec_stack: set) -> bool:
            visited.add(node)
            rec_stack.add(node)

            for neighbor in dep_graph.get(node, []):
                if neighbor not in visited:
                    if has_cycle(neighbor, visited, rec_stack):
                        return True
                elif neighbor in rec_stack:
                    return True

            rec_stack.remove(node)
            return False

        visited = set()
        rec_stack = set()

        for node in dep_graph:
            if node not in visited:
                if has_cycle(node, visited, rec_stack):
                    return True

        return False

    def get_schedule_dependencies(self, schedule_id: str) -> dict:
        """Get predecessors and successors for a schedule"""
        all_schedules = self.get_all_schedules()

        current = None
        for s in all_schedules:
            if s.get("ID") == schedule_id:
                current = s
                break

        if not current:
            return {"predecessors": [], "successors": []}

        deps_str = current.get("Dependencies", "")
        predecessors = [d.strip() for d in deps_str.split(",") if d.strip()] if deps_str else []

        successors = []
        for s in all_schedules:
            deps_str = s.get("Dependencies", "")
            if deps_str:
                deps = [d.strip() for d in deps_str.split(",")]
                if schedule_id in deps:
                    successors.append(s.get("ID"))

        return {"predecessors": predecessors, "successors": successors}

    def _col_num_to_letter(self, col_num: int) -> str:
        """Convert column number (1-based) to Excel-style letter (A, B, ... Z, AA, AB, ...)"""
        result = ""
        while col_num > 0:
            col_num, remainder = divmod(col_num - 1, 26)
            result = chr(65 + remainder) + result
        return result

    def reorder_schedule_rows(self, orders: list[dict]) -> bool:
        """Reorder schedule rows by rearranging actual row positions in Google Sheets

        Args:
            orders: [{"id": "SCH-2025-001", "displayOrder": 10}, ...]
                    Rows are arranged by ascending displayOrder
        """
        try:
            schedule = self._get_schedule_sheet()
            all_data = schedule.get_all_values()

            if len(all_data) <= 1:
                return True

            headers = all_data[0]
            data_rows = all_data[1:]

            id_to_data = {}
            for row in data_rows:
                if row and row[0]:
                    id_to_data[row[0]] = row

            id_to_order = {}
            for order in orders:
                schedule_id = order.get("id")
                display_order = order.get("displayOrder", order.get("display_order", 9999))
                if schedule_id:
                    id_to_order[schedule_id] = display_order

            max_order = max(id_to_order.values()) if id_to_order else 0
            for row_id in id_to_data.keys():
                if row_id not in id_to_order:
                    max_order += 1
                    id_to_order[row_id] = max_order

            sorted_ids = sorted(id_to_data.keys(), key=lambda x: id_to_order.get(x, 9999))
            sorted_rows = [id_to_data[sid] for sid in sorted_ids if sid in id_to_data]

            if sorted_rows:
                num_rows = len(data_rows)
                num_cols = len(headers)
                last_col = self._col_num_to_letter(num_cols)

                if num_rows > 0:
                    clear_range = f"A2:{last_col}{num_rows + 1}"
                    schedule.batch_clear([clear_range])

                update_range = f"A2:{last_col}{len(sorted_rows) + 1}"
                schedule.update(update_range, sorted_rows)

            return True

        except Exception as e:
            print(f"Failed to reorder schedule rows: {e}")
            return False

    def sync_schedule_order_from_web(self, ordered_ids: list[str]) -> bool:
        """Sync Google Sheets row order to match web app display order

        Args:
            ordered_ids: Schedule IDs in desired order
        """
        try:
            schedule = self._get_schedule_sheet()
            all_data = schedule.get_all_values()

            if len(all_data) <= 1:
                return True

            headers = all_data[0]
            data_rows = all_data[1:]

            id_to_data = {}
            for row in data_rows:
                if row and row[0]:
                    id_to_data[row[0]] = row

            sorted_rows = []
            used_ids = set()

            for sid in ordered_ids:
                if sid in id_to_data:
                    sorted_rows.append(id_to_data[sid])
                    used_ids.add(sid)

            for sid, row in id_to_data.items():
                if sid not in used_ids:
                    sorted_rows.append(row)

            if sorted_rows:
                num_rows = len(data_rows)
                num_cols = len(headers)
                last_col = self._col_num_to_letter(num_cols)

                if num_rows > 0:
                    clear_range = f"A2:{last_col}{num_rows + 1}"
                    schedule.batch_clear([clear_range])

                update_range = f"A2:{last_col}{len(sorted_rows) + 1}"
                schedule.update(update_range, sorted_rows)

            return True

        except Exception as e:
            print(f"Failed to sync order from web: {e}")
            return False
