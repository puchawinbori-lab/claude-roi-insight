# Claude ROI Insight Calculator - Backend

Python Flask backend for analyzing JIRA data and calculating ROI metrics for Claude Code adoption.

## Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Run the Flask server:**
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### `POST /api/fetch-jira`
Fetches JIRA data and performs ROI analysis.

**Request Body:**
```json
{
  "jira_url": "https://yourcompany.atlassian.net",
  "email": "your-email@company.com",
  "api_token": "your-api-token",
  "project_name": "Your Project Name",
  "claude_adoption_date": "2025-08-25"
}
```

### `GET /api/dashboard-data?claude_adoption_date=2025-08-25`
Returns cached analysis data for the dashboard.

### `POST /api/projects`
Lists available JIRA projects for given credentials.

## Data Storage

- `data/jira_export.csv` - Raw JIRA export
- `data/processed_data.csv` - Processed data with calculations

## ROI Calculations

**Assumptions:**
- Engineer Cost: $100,000/year
- Hours per Day: 8
- Hourly Rate: $50/hour

**Metrics:**
- Hours per ticket = (Due Date - Start Date) × 8 hours/day
- Cost per ticket = Hours × Hourly Rate
- Time savings % = (Pre Claude Avg - Post Claude Avg) / Pre Claude Avg × 100
