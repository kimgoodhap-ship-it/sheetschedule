"""SheetSchedule API Server - Google Sheets to Gantt Chart"""

import os
import re
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sheets_handler import SheetsHandler, SCHEDULE_STATUS_VALUES

# ========== Color conversion mappings ==========
HEX_TO_EMOJI = {
    '#F44336': '🔴 Red',
    '#FF9800': '🟠 Orange',
    '#FFEB3B': '🟡 Yellow',
    '#4CAF50': '🟢 Green',
    '#2196F3': '🔵 Blue',
    '#9C27B0': '🟣 Purple',
    '#E91E63': '🩷 Pink',
    '#03A9F4': '🩵 Sky',
    '#795548': '🤎 Brown',
    '#607D8B': '⚫ Gray'
}

EMOJI_TO_HEX = {v: k for k, v in HEX_TO_EMOJI.items()}

# Legacy Korean emoji mappings (for backward compatibility with existing sheets)
LEGACY_EMOJI_TO_HEX = {
    '🔴 빨강': '#F44336',
    '🟠 주황': '#FF9800',
    '🟡 노랑': '#FFEB3B',
    '🟢 초록': '#4CAF50',
    '🔵 파랑': '#2196F3',
    '🟣 보라': '#9C27B0',
    '🩷 분홍': '#E91E63',
    '🩵 하늘': '#03A9F4',
    '🤎 갈색': '#795548',
    '⚫ 검정': '#607D8B'
}


def convert_color_to_emoji(color: str) -> str:
    """Convert hex code to emoji+name for Google Sheets storage"""
    if not color:
        return '🟢 Green'

    if color in EMOJI_TO_HEX or color in LEGACY_EMOJI_TO_HEX:
        return color

    color_upper = color.upper()
    return HEX_TO_EMOJI.get(color_upper, '🟢 Green')


def convert_color_to_hex(color: str) -> str:
    """Convert emoji+name to hex code for web app"""
    if not color:
        return '#4CAF50'

    if color.startswith('#'):
        return color.upper()

    # Check English emoji names first, then legacy Korean
    hex_val = EMOJI_TO_HEX.get(color)
    if hex_val:
        return hex_val

    hex_val = LEGACY_EMOJI_TO_HEX.get(color)
    if hex_val:
        return hex_val

    return '#4CAF50'


# Global handler
sheets_handler: Optional[SheetsHandler] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App startup/shutdown lifecycle"""
    global sheets_handler

    try:
        sheets_handler = SheetsHandler()
        print("Google Sheets connected successfully")
    except Exception as e:
        print(f"Google Sheets connection failed: {e}")
        sheets_handler = None

    yield
    sheets_handler = None


app = FastAPI(
    title="SheetSchedule API",
    description="Google Sheets to Gantt Chart - REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000")
origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========== Models ==========

class ScheduleResponse(BaseModel):
    """Schedule response model"""
    id: str
    project: str
    category: str
    name: str
    assignee: str
    startDate: str
    endDate: str
    dependencies: list[str]
    status: str
    progress: int = 0
    color: str
    memo: str
    updatedAt: str = ""
    displayOrder: int = 0


class ScheduleCreateRequest(BaseModel):
    """Schedule creation request"""
    project: str
    category: str = ""
    name: str
    startDate: str
    endDate: str
    assignee: str = ""
    dependencies: list[str] = []
    status: str = "Planned"
    color: str = "#4CAF50"
    memo: str = ""


class ScheduleUpdateRequest(BaseModel):
    """Schedule update request"""
    project: Optional[str] = None
    category: Optional[str] = None
    name: Optional[str] = None
    assignee: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    dependencies: Optional[list[str]] = None
    status: Optional[str] = None
    color: Optional[str] = None
    memo: Optional[str] = None
    displayOrder: Optional[int] = None


class ReorderItem(BaseModel):
    """Reorder item"""
    id: str
    displayOrder: int


class ReorderRequest(BaseModel):
    """Bulk reorder request"""
    orders: list[ReorderItem]


class SyncOrderRequest(BaseModel):
    """Order sync request"""
    orderedIds: list[str]


SCHEDULE_ID_PATTERN = re.compile(r'^SCH-\d{4}-\d{3}$')


def validate_schedule_id(schedule_id: str):
    """Validate schedule ID format. Raises 400 if invalid."""
    if not SCHEDULE_ID_PATTERN.match(schedule_id):
        raise HTTPException(status_code=400, detail="Invalid schedule ID format. Expected: SCH-YYYY-NNN")


# ========== Helper ==========

def convert_schedule_to_response(schedule: dict, row_index: int = 0) -> ScheduleResponse:
    """Convert Google Sheets schedule to API response format"""
    deps_str = schedule.get("Dependencies", "")
    dependencies = [d.strip() for d in deps_str.split(",") if d.strip()] if deps_str else []

    name = schedule.get("Task", "") or schedule.get("작업명", "") or schedule.get("일정명", "")

    raw_color = schedule.get("Color", "") or schedule.get("색상", "#4CAF50")
    color_hex = convert_color_to_hex(raw_color)

    display_order = row_index

    return ScheduleResponse(
        id=schedule.get("ID", ""),
        project=schedule.get("Project", "") or schedule.get("프로젝트", ""),
        category=schedule.get("Category", "") or schedule.get("구분", ""),
        name=name,
        assignee=schedule.get("Assignee", "") or schedule.get("담당자", ""),
        startDate=str(schedule.get("Start Date", "") or schedule.get("시작일", "")),
        endDate=str(schedule.get("End Date", "") or schedule.get("종료일", "")),
        dependencies=dependencies,
        status=str(schedule.get("Status", "Planned") or schedule.get("상태", "Planned")).strip(),
        progress=0,
        color=color_hex,
        memo=schedule.get("Memo", "") or schedule.get("메모", ""),
        updatedAt="",
        displayOrder=display_order
    )


# ========== Endpoints ==========

@app.get("/")
async def root():
    return {"message": "SheetSchedule API", "status": "running"}


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "sheets_connected": sheets_handler is not None
    }


@app.get("/api/sheet-url")
async def get_sheet_url():
    """Get the Google Spreadsheet URL for direct access"""
    spreadsheet_id = os.getenv("GOOGLE_SPREADSHEET_ID")
    if not spreadsheet_id:
        raise HTTPException(status_code=404, detail="Spreadsheet ID not configured")
    return {"url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit"}


@app.get("/api/projects", response_model=list[str])
async def get_projects(source: Optional[str] = None):
    """Get unique project names from schedules"""
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    try:
        schedules = sheets_handler.get_all_schedules()
        projects = set()
        for s in schedules:
            p = s.get("Project") or s.get("프로젝트")
            if p:
                projects.add(str(p))
        return sorted(projects)
    except Exception as e:
        print(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch projects")


@app.get("/api/schedules", response_model=list[ScheduleResponse])
async def get_schedules(project: Optional[str] = None):
    """Get all schedules, optionally filtered by project"""
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    try:
        if project:
            schedules = sheets_handler.get_schedules_by_project(project)
            all_schedules = sheets_handler.get_all_schedules()
            id_to_index = {s.get("ID"): i for i, s in enumerate(all_schedules)}
            return [
                convert_schedule_to_response(s, id_to_index.get(s.get("ID"), 0))
                for s in schedules
            ]
        else:
            schedules = sheets_handler.get_all_schedules()
            return [
                convert_schedule_to_response(s, i)
                for i, s in enumerate(schedules)
            ]
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/schedules/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(schedule_id: str):
    """Get a single schedule by ID"""
    validate_schedule_id(schedule_id)
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    try:
        all_schedules = sheets_handler.get_all_schedules()
        row_index = 0
        schedule = None

        for i, s in enumerate(all_schedules):
            if s.get("ID") == schedule_id:
                schedule = s
                row_index = i
                break

        if not schedule:
            raise HTTPException(status_code=404, detail=f"Schedule not found: {schedule_id}")

        return convert_schedule_to_response(schedule, row_index)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/schedules", response_model=ScheduleResponse)
async def create_schedule(request: ScheduleCreateRequest):
    """Create a new schedule"""
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    if request.status not in SCHEDULE_STATUS_VALUES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed values: {SCHEDULE_STATUS_VALUES}"
        )

    try:
        dependencies_str = ",".join(request.dependencies) if request.dependencies else ""
        color_emoji = convert_color_to_emoji(request.color)

        schedule_id = sheets_handler.add_schedule(
            project=request.project,
            category=request.category,
            name=request.name,
            start_date=request.startDate,
            end_date=request.endDate,
            assignee=request.assignee,
            dependencies=dependencies_str,
            status=request.status,
            color=color_emoji,
            memo=request.memo
        )

        if not schedule_id:
            raise HTTPException(status_code=500, detail="Failed to create schedule")

        schedule = sheets_handler.get_schedule_by_id(schedule_id)
        return convert_schedule_to_response(schedule)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.patch("/api/schedules/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(schedule_id: str, request: ScheduleUpdateRequest):
    """Update an existing schedule"""
    validate_schedule_id(schedule_id)
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    existing = sheets_handler.get_schedule_by_id(schedule_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Schedule not found: {schedule_id}")

    cleaned_status = request.status.strip() if request.status else None
    if cleaned_status and cleaned_status not in SCHEDULE_STATUS_VALUES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed values: {SCHEDULE_STATUS_VALUES}"
        )

    if request.dependencies is not None:
        if sheets_handler.check_circular_dependency(schedule_id, request.dependencies):
            raise HTTPException(status_code=400, detail="Circular dependency detected")

    try:
        update_data = {}
        if request.project is not None:
            update_data["project"] = request.project
        if request.category is not None:
            update_data["category"] = request.category
        if request.name is not None:
            update_data["name"] = request.name
        if request.assignee is not None:
            update_data["assignee"] = request.assignee
        if request.startDate is not None:
            update_data["start_date"] = request.startDate
        if request.endDate is not None:
            update_data["end_date"] = request.endDate
        if request.dependencies is not None:
            update_data["dependencies"] = ",".join(request.dependencies)
        if cleaned_status is not None:
            update_data["status"] = cleaned_status
        if request.color is not None:
            update_data["color"] = convert_color_to_emoji(request.color)
        if request.memo is not None:
            update_data["memo"] = request.memo

        success = sheets_handler.update_schedule(schedule_id, **update_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update schedule")

        schedule = sheets_handler.get_schedule_by_id(schedule_id)
        return convert_schedule_to_response(schedule)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.delete("/api/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str):
    """Delete a schedule"""
    validate_schedule_id(schedule_id)
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    try:
        success = sheets_handler.delete_schedule(schedule_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Schedule not found: {schedule_id}")

        return {"message": "Schedule deleted", "schedule_id": schedule_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/schedules/reorder")
async def reorder_schedules(request: ReorderRequest):
    """Reorder schedules by changing actual row positions in Google Sheets"""
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    try:
        orders = [
            {"id": item.id, "displayOrder": item.displayOrder}
            for item in request.orders
        ]

        success = sheets_handler.reorder_schedule_rows(orders)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to reorder")

        return {
            "message": "Reorder complete",
            "updated_count": len(orders)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/api/schedules/sync-order")
async def sync_schedule_order(request: SyncOrderRequest):
    """Sync Google Sheets row order to match web app display order"""
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    try:
        success = sheets_handler.sync_schedule_order_from_web(request.orderedIds)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to sync order")

        return {
            "message": "Google Sheets row order synced with web app",
            "synced_count": len(request.orderedIds)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/api/schedules/{schedule_id}/dependencies")
async def get_schedule_dependencies(schedule_id: str):
    """Get predecessor and successor schedules"""
    validate_schedule_id(schedule_id)
    if sheets_handler is None:
        raise HTTPException(status_code=503, detail="Google Sheets not connected")

    schedule = sheets_handler.get_schedule_by_id(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail=f"Schedule not found: {schedule_id}")

    try:
        deps = sheets_handler.get_schedule_dependencies(schedule_id)

        incomplete_predecessors = []
        all_schedules = sheets_handler.get_all_schedules()
        schedule_map = {s.get("ID"): s for s in all_schedules}

        for pred_id in deps["predecessors"]:
            pred = schedule_map.get(pred_id)
            if pred:
                status = pred.get("Status") or pred.get("상태", "")
                if status != "Completed" and status != "완료":
                    incomplete_predecessors.append({
                        "id": pred_id,
                        "name": pred.get("Task", "") or pred.get("작업명", "") or pred.get("일정명", ""),
                        "status": status
                    })

        return {
            "schedule_id": schedule_id,
            "predecessors": deps["predecessors"],
            "successors": deps["successors"],
            "incomplete_predecessors": incomplete_predecessors,
            "has_warning": len(incomplete_predecessors) > 0
        }
    except Exception as e:
        print(f"Internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
