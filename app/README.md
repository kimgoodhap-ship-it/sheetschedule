# SheetSchedule

**Google Sheets to Gantt Chart, Instantly.**

Turn your Google Sheets schedule into a beautiful, interactive Gantt chart. Add, edit, drag-and-drop tasks directly in the web app, and all changes sync back to your Google Sheet in real time.

## Features

- **Google Sheets Integration** - Two-way sync between your spreadsheet and the Gantt chart
- **Drag & Drop** - Reorder tasks and adjust dates by dragging
- **3 Time Scales** - Monthly, Weekly, and Daily views
- **Project Hierarchy** - Organize tasks by Project > Category > Task
- **Project Filter** - Focus on one project at a time
- **PNG Export** - Save your Gantt chart as an image
- **Floating Calendar** - Quick month overview sidebar
- **Task Dependencies** - Link tasks with predecessor relationships
- **Color Coding** - 10 color options for visual organization

## Quick Start

### 1. Set Up Google Sheets

1. Create a new Google Spreadsheet
2. Rename the first sheet to `schedule`
3. Add these column headers in row 1:

   | A | B | C | D | E | F | G | H | I | J | K |
   |---|---|---|---|---|---|---|---|---|---|---|
   | ID | Project | Category | Task | Assignee | Start Date | End Date | Dependencies | Status | Color | Memo |

4. (Optional) Import the sample data from `sample-data/schedule-template.csv`

### 2. Set Up Google Service Account

See [docs/google-setup.md](docs/google-setup.md) for detailed instructions.

Quick version:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Google Sheets API
3. Create a Service Account and download the JSON key
4. Share your Google Spreadsheet with the service account email

### 3. Configure Environment

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `GOOGLE_CREDENTIALS_FILE` - path to your service account JSON key
- `GOOGLE_SPREADSHEET_ID` - your spreadsheet ID (from the URL)

### 4. Run the Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5174 in your browser.

## Deployment

See [docs/deployment.md](docs/deployment.md) for deployment guides:
- **Frontend**: Netlify, Vercel, or any static host
- **Backend**: Railway, Render, Google Cloud Run, or any Python host

## Customization

### Frontend
- Edit `frontend/src/config.ts` to change the product name, status options, and color palette
- Edit `frontend/src/App.css` to customize styles

### Backend
- Edit `backend/config.py` to change status values, color mappings, and sheet column names

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, gantt-task-react, @dnd-kit, html2canvas
- **Backend**: Python, FastAPI, gspread (Google Sheets API)
- **Data**: Google Sheets (no database needed)

## Project Structure

```
app/
├── frontend/           # React web app
│   ├── src/
│   │   ├── components/ # UI components (GanttChart, Modal, etc.)
│   │   ├── api/        # API client
│   │   ├── utils/      # Utility functions
│   │   └── config.ts   # App configuration
│   └── ...
├── backend/            # FastAPI server
│   ├── main.py         # API endpoints
│   ├── sheets_handler.py # Google Sheets operations
│   └── config.py       # Backend configuration
├── sample-data/        # Sample CSV for quick start
├── docs/               # Setup and deployment guides
└── .env.example        # Environment variable template
```

## Security

- **Never commit** `credentials.json` or `.env` files to git
- **Set CORS** to your specific domain in production (never use `*`)
- **Use HTTPS** for both frontend and backend
- **Store credentials** as environment variables in your hosting platform, not in code

See [docs/deployment.md](docs/deployment.md) for detailed security guidelines.

## License

MIT
