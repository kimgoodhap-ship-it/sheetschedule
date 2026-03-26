# Google Service Account Setup Guide

This guide walks you through setting up a Google Service Account to connect SheetSchedule with your Google Sheets.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** at the top, then **New Project**
3. Enter a project name (e.g., "SheetSchedule") and click **Create**
4. Make sure the new project is selected

## Step 2: Enable Google Sheets API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click on it and click **Enable**
4. Also search for and enable "Google Drive API"

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **Service Account**
3. Enter a name (e.g., "sheetschedule-bot") and click **Create and Continue**
4. For role, select **Editor** (or skip this step)
5. Click **Done**

## Step 4: Download the JSON Key

1. In the **Service Accounts** list, click on your new service account
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** and click **Create**
5. Save the downloaded file as `credentials.json` in the `backend/` directory

**IMPORTANT**: Never commit this file to version control. It's already in `.gitignore`.

## Step 5: Share Your Google Sheet

1. Open your Google Spreadsheet
2. Click **Share** in the top right
3. Paste the service account email (looks like `sheetschedule-bot@your-project.iam.gserviceaccount.com`)
4. Set permission to **Editor**
5. Click **Send**

## Step 6: Get Your Spreadsheet ID

Your spreadsheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
```

Copy the ID between `/d/` and `/edit`.

## Step 7: Configure Environment

Add these to your `.env` file:

```bash
GOOGLE_CREDENTIALS_FILE=./credentials.json
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

## For Cloud Deployment

Instead of a file, encode the credentials as Base64:

```bash
cat credentials.json | base64
```

Then set in your deployment environment:

```bash
GOOGLE_CREDENTIALS_BASE64=your_base64_encoded_string
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Google Sheets not connected" | Check that credentials file path is correct |
| "Permission denied" | Make sure the service account email has Editor access to your spreadsheet |
| "Spreadsheet not found" | Double-check your GOOGLE_SPREADSHEET_ID |
| "API not enabled" | Enable both Google Sheets API and Google Drive API |
