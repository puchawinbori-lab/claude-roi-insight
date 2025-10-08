# Claude ROI Insight Calculator - Setup Guide

A full-stack web application that analyzes JIRA data to calculate ROI metrics for Claude Code adoption.

## Architecture

```
┌─────────────┐      API Call       ┌──────────────┐      JIRA API      ┌─────────┐
│   React     │ ───────────────────> │ Flask Backend│ ──────────────────> │  JIRA   │
│   Frontend  │ <─────────────────── │  (Python)    │ <────────────────── │         │
└─────────────┘   JSON Response      └──────────────┘    Task Data        └─────────┘
       │                                     │
       │                                     │
       v                                     v
  Display ROI                          Analyze Data
   Metrics                            Calculate ROI
```

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **JIRA Account** with API token access

## Quick Start

### 1. Clone and Navigate

```bash
cd claude-roi-insight
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

Open a **new terminal** in the project root:

```bash
# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or similar)

### 4. Access the Application

1. Open your browser to `http://localhost:5173`
2. Click "Get Started"
3. Fill in the form with your JIRA credentials
4. View your ROI dashboard!

## JIRA API Token Setup

To use this tool, you need a JIRA API token:

1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **"Create API token"**
3. Give it a name (e.g., "Claude ROI Calculator")
4. **Copy the token** (you won't be able to see it again!)
5. Use this token in the application form

## How It Works

### Form Page (`/form`)

**User Inputs:**
- Email (JIRA account email)
- JIRA Instance URL (e.g., `https://yourcompany.atlassian.net`)
- JIRA API Token
- Claude Code Adoption Date (when you started using Claude Code)

### Data Flow

1. **Form Submission**
   - User submits credentials
   - Frontend calls `POST /api/fetch-jira`
   - Backend connects to JIRA API

2. **Data Fetching**
   - Backend fetches all tasks from specified JIRA project
   - Exports to CSV (`backend/data/jira_export.csv`)

3. **ROI Analysis**
   - Calculates hours per ticket: `(Due Date - Start Date) × 8 hours/day`
   - Calculates cost per ticket: `Hours × $50/hour`
   - Compares Pre-Claude vs Post-Claude metrics
   - Generates summary statistics

4. **Dashboard Display**
   - Frontend receives analysis results
   - Displays animated metrics
   - Shows detailed breakdowns

### ROI Calculations

**Cost Assumptions:**
- Engineer Annual Cost: **$100,000**
- Working Days/Year: 250
- Hours/Day: 8
- **Hourly Rate: $50**

**Key Metrics:**
- **Time Savings %** = (Pre Avg - Post Avg) / Pre Avg × 100
- **Hours Saved** = (Pre Avg Hours - Post Avg Hours) × Post Tasks
- **Cost Savings** = Hours Saved × Hourly Rate
- **Annual Projection** = Cost Savings extrapolated to 12 months

## Project Structure

```
claude-roi-insight/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── jira_api_client.py     # JIRA API integration
│   ├── data_analyzer.py       # ROI calculation engine
│   ├── requirements.txt       # Python dependencies
│   └── data/                  # CSV storage (auto-created)
│
├── src/
│   ├── pages/
│   │   ├── Landing.tsx        # Home page
│   │   ├── Form.tsx           # Data input form
│   │   ├── Loading.tsx        # Loading state
│   │   └── Dashboard.tsx      # ROI metrics display
│   └── components/
│       └── dashboard/         # Dashboard components
│
└── SETUP.md                   # This file
```

## API Endpoints

### `POST /api/fetch-jira`

Fetches and analyzes JIRA data.

**Request:**
```json
{
  "jira_url": "https://yourcompany.atlassian.net",
  "email": "you@company.com",
  "api_token": "ATATT3xFf...",
  "project_name": "FinTechCo Backlog",
  "claude_adoption_date": "2025-08-25"
}
```

**Response:**
```json
{
  "success": true,
  "total_issues": 434,
  "summary_metrics": {
    "pre_claude": { ... },
    "post_claude": { ... },
    "improvements": { ... }
  }
}
```

### `GET /api/health`

Health check endpoint.

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

## Troubleshooting

### Backend won't start

```bash
# Make sure you're in the backend directory
cd backend

# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install -r requirements.txt

# Try running directly
python app.py
```

### Frontend can't connect to backend

1. Make sure backend is running (`http://localhost:5000`)
2. Check `.env` file has correct `VITE_API_URL`
3. Restart frontend dev server after changing `.env`

### JIRA connection fails

1. Verify JIRA URL (no trailing slash)
2. Check API token is valid
3. Ensure you have access to the project
4. Try project name in quotes if it has spaces

### "No data available" on dashboard

1. Make sure you submitted the form successfully
2. Check browser console for errors
3. Verify backend logs for API errors
4. Try clearing sessionStorage and resubmitting

## Development

### Frontend

```bash
# Run dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend

```bash
# Run with auto-reload
FLASK_ENV=development python app.py

# Check logs for debugging
# Logs appear in terminal where Flask is running
```

## Deployment

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variable: `VITE_API_URL=<your-backend-url>`

### Backend (Heroku/Railway/Render)

1. Create `Procfile`:
   ```
   web: cd backend && python app.py
   ```
2. Deploy with `requirements.txt`
3. Set PORT environment variable if needed

## Security Notes

⚠️ **Important Security Considerations:**

- Never commit API tokens to version control
- Use environment variables for sensitive data
- Consider implementing rate limiting in production
- Add authentication for production deployments
- The current setup is for **demonstration/internal use only**

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs (`backend/app.py` terminal output)
3. Check browser console for frontend errors
4. Verify JIRA credentials and permissions

## License

This is a demonstration project for calculating Claude Code ROI.
