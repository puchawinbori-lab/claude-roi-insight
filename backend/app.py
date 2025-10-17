"""
Flask Backend API for Claude ROI Insight Calculator
Handles JIRA API calls and ROI analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from jira_api_client import JiraAPIClient
from data_analyzer import ROIAnalyzer
import os
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Add request/response logging middleware
@app.before_request
def log_request():
    print(f"\n🔵 [{datetime.now().strftime('%H:%M:%S')}] Incoming {request.method} request to {request.path}")
    print(f"   Remote addr: {request.remote_addr}")
    print(f"   Origin: {request.headers.get('Origin', 'N/A')}")
    if request.is_json:
        print(f"   Content-Type: {request.headers.get('Content-Type')}")

@app.after_request
def log_response(response):
    print(f"🟢 [{datetime.now().strftime('%H:%M:%S')}] Response {response.status}")
    print(f"   Content-Type: {response.headers.get('Content-Type')}")
    return response

# Data storage paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

JIRA_EXPORT_PATH = os.path.join(DATA_DIR, 'jira_export.csv')
PROCESSED_DATA_PATH = os.path.join(DATA_DIR, 'processed_data.csv')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Claude ROI API is running'})


@app.route('/api/fetch-demo-data', methods=['POST'])
def fetch_demo_data():
    """
    Fetch static/demo JIRA data (no API call needed)

    Expected JSON body:
    {
        "claude_adoption_date": "2025-08-25",
        "company": "fintechco" or "pharmaco"
    }
    """
    try:
        data = request.get_json()
        print("\n" + "="*70)
        print("📥 RECEIVED REQUEST TO /api/fetch-demo-data")
        print("="*70)

        # Validate required fields
        if 'claude_adoption_date' not in data:
            return jsonify({
                'error': 'Missing required field: claude_adoption_date'
            }), 400

        claude_adoption_date = data['claude_adoption_date'].strip()
        company = data.get('company', 'fintechco').strip().lower()

        print(f"✅ Using Claude Adoption Date: {claude_adoption_date}")
        print(f"✅ Selected Company: {company}")

        # Select the correct data file based on company
        if company == 'fintechco':
            data_filename = 'fintechco_data.csv'
        elif company == 'pharmaco':
            data_filename = 'pharmaco_data.csv'
        else:
            # Default to fintechco if unknown company
            data_filename = 'fintechco_data.csv'
            print(f"⚠️  Unknown company '{company}', defaulting to fintechco")

        DEMO_DATA_PATH = os.path.join(DATA_DIR, data_filename)

        # Check if demo data exists
        if not os.path.exists(DEMO_DATA_PATH):
            return jsonify({
                'error': f'Data file not found: {data_filename}',
                'expected_path': DEMO_DATA_PATH
            }), 404

        print(f"📂 Loading data from: {DEMO_DATA_PATH}")

        # Analyze data using the selected CSV
        analyzer = ROIAnalyzer(DEMO_DATA_PATH, claude_adoption_date)

        # Get metrics
        summary_metrics = analyzer.get_summary_metrics()
        time_series_data = analyzer.get_time_series_data()
        status_breakdown = analyzer.get_status_breakdown()
        priority_breakdown = analyzer.get_priority_breakdown()

        # Count total issues from CSV
        import pandas as pd
        df = pd.read_csv(DEMO_DATA_PATH)
        total_issues = len(df)

        print(f"✅ Successfully analyzed {total_issues} issues for {company}")

        return jsonify({
            'success': True,
            'message': f'Successfully analyzed {total_issues} issues for {company}',
            'total_issues': total_issues,
            'company': company,
            'summary_metrics': summary_metrics,
            'time_series_data': time_series_data,
            'status_breakdown': status_breakdown,
            'priority_breakdown': priority_breakdown,
            'demo_mode': True
        })

    except Exception as e:
        print(f"Error in fetch_demo_data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'trace': traceback.format_exc()
        }), 500


@app.route('/api/fetch-jira', methods=['POST'])
def fetch_jira_data():
    """
    Fetch JIRA data based on user credentials and project

    Expected JSON body:
    {
        "jira_url": "https://yourcompany.atlassian.net",
        "email": "your-email@company.com",
        "api_token": "your-api-token",
        "project_name": "FinTechCo Backlog",  # or project key
        "claude_adoption_date": "2025-08-25"
    }
    """
    try:
        data = request.get_json()
        print("\n" + "="*70)
        print("📥 RECEIVED REQUEST TO /api/fetch-jira")
        print("="*70)
        print(f"Request data: {data}")

        # Validate required fields
        required_fields = ['jira_url', 'email', 'api_token', 'claude_adoption_date']
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        jira_url = data['jira_url'].strip()
        email = data['email'].strip()
        api_token = data['api_token'].strip()
        claude_adoption_date = data['claude_adoption_date'].strip()
        project_name = data.get('project_name', '').strip()
        project_key = data.get('project_key', '').strip()

        print(f"✅ All required fields present")
        print(f"   JIRA URL: {jira_url}")
        print(f"   Email: {email}")
        print(f"   API Token: {api_token[:15]}..." if len(api_token) > 15 else f"   API Token: {api_token[:5]}...")
        print(f"   Project Name: {project_name}")
        print(f"   Claude Adoption Date: {claude_adoption_date}")

        # Extract base URL (in case user provided full project URL)
        from urllib.parse import urlparse
        parsed_url = urlparse(jira_url)
        jira_base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

        # Initialize JIRA client
        print(f"Original URL: {jira_url}")
        print(f"Using base URL: {jira_base_url}")
        print(f"Email: {email}")
        print(f"API Token: {api_token[:10]}...")
        client = JiraAPIClient(jira_base_url, email, api_token)

        # Test connection
        connection_result = client.test_connection()
        print(f"Connection test result: {connection_result}")
        if not connection_result:
            return jsonify({'error': 'Failed to connect to JIRA. Please check your credentials.'}), 401

        # Build JQL query
        if project_name:
            jql_query = f'project = "{project_name}" ORDER BY created ASC'
        elif project_key:
            jql_query = f'project = {project_key} ORDER BY created ASC'
        else:
            # Try to get all projects and let user know
            projects = client.get_projects()
            return jsonify({
                'error': 'No project specified',
                'available_projects': [{'key': p['key'], 'name': p['name']} for p in projects]
            }), 400

        print(f"Fetching issues with JQL: {jql_query}")

        # Fetch all issues
        issues = client.get_all_issues(jql_query)

        if not issues:
            return jsonify({
                'error': 'No issues found in the specified project',
                'jql_query': jql_query
            }), 404

        print(f"Retrieved {len(issues)} issues")

        # Export to CSV
        client.export_to_csv(issues, JIRA_EXPORT_PATH)

        # Analyze data
        print(f"Analyzing data with Claude adoption date: {claude_adoption_date}")
        analyzer = ROIAnalyzer(JIRA_EXPORT_PATH, claude_adoption_date)

        # Get metrics
        summary_metrics = analyzer.get_summary_metrics()
        time_series_data = analyzer.get_time_series_data()
        status_breakdown = analyzer.get_status_breakdown()
        priority_breakdown = analyzer.get_priority_breakdown()

        # Export processed data
        analyzer.export_processed_data(PROCESSED_DATA_PATH)

        return jsonify({
            'success': True,
            'message': f'Successfully fetched and analyzed {len(issues)} issues',
            'total_issues': len(issues),
            'summary_metrics': summary_metrics,
            'time_series_data': time_series_data,
            'status_breakdown': status_breakdown,
            'priority_breakdown': priority_breakdown
        })

    except Exception as e:
        print(f"Error in fetch_jira_data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'trace': traceback.format_exc()
        }), 500


@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    """
    Get processed dashboard data
    Returns cached analysis if available
    """
    try:
        # Check if we have processed data
        if not os.path.exists(JIRA_EXPORT_PATH):
            return jsonify({
                'error': 'No data available. Please fetch JIRA data first.',
                'has_data': False
            }), 404

        # Get query parameters
        claude_adoption_date = request.args.get('claude_adoption_date')

        if not claude_adoption_date:
            return jsonify({
                'error': 'claude_adoption_date query parameter is required'
            }), 400

        # Re-analyze with potentially new adoption date
        analyzer = ROIAnalyzer(JIRA_EXPORT_PATH, claude_adoption_date)

        # Get all metrics
        summary_metrics = analyzer.get_summary_metrics()
        time_series_data = analyzer.get_time_series_data()
        status_breakdown = analyzer.get_status_breakdown()
        priority_breakdown = analyzer.get_priority_breakdown()

        return jsonify({
            'success': True,
            'has_data': True,
            'summary_metrics': summary_metrics,
            'time_series_data': time_series_data,
            'status_breakdown': status_breakdown,
            'priority_breakdown': priority_breakdown
        })

    except Exception as e:
        print(f"Error in get_dashboard_data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'trace': traceback.format_exc()
        }), 500


@app.route('/api/projects', methods=['POST'])
def get_projects():
    """
    Get list of available JIRA projects

    Expected JSON body:
    {
        "jira_url": "https://yourcompany.atlassian.net",
        "email": "your-email@company.com",
        "api_token": "your-api-token"
    }
    """
    try:
        data = request.get_json()

        required_fields = ['jira_url', 'email', 'api_token']
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        # Initialize JIRA client
        client = JiraAPIClient(data['jira_url'], data['email'], data['api_token'])

        # Test connection
        if not client.test_connection():
            return jsonify({'error': 'Failed to connect to JIRA'}), 401

        # Get projects
        projects = client.get_projects()

        return jsonify({
            'success': True,
            'projects': [{'key': p['key'], 'name': p['name'], 'id': p['id']} for p in projects]
        })

    except Exception as e:
        print(f"Error in get_projects: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/usage-data', methods=['GET'])
def get_usage_data():
    """
    Get Claude Code API usage data for analytics

    Query parameters:
    - company: 'fintechco' or 'pharmaco' (required)

    Returns processed usage metrics including:
    - Time series data (lines of code, commits, PRs)
    - Organization penetration stats
    - User leaderboard
    - Active users trends
    """
    try:
        import json

        # Get company parameter from query string
        company = request.args.get('company', '').strip().lower()

        if not company:
            return jsonify({
                'error': 'Missing required query parameter: company'
            }), 400

        # Select the correct data file based on company
        if company == 'fintechco':
            data_filename = 'fintechco_api_usage_data.json'
        elif company == 'pharmaco':
            data_filename = 'pharmaco_api_usage_data.json'
        else:
            return jsonify({
                'error': f'Invalid company: {company}. Must be "fintechco" or "pharmaco"'
            }), 400

        API_DATA_PATH = os.path.join(DATA_DIR, data_filename)

        if not os.path.exists(API_DATA_PATH):
            return jsonify({
                'error': 'API usage data not found',
                'expected_path': API_DATA_PATH,
                'company': company
            }), 404

        print(f"📂 Loading API usage data for {company} from: {API_DATA_PATH}")

        with open(API_DATA_PATH, 'r', encoding='utf-8') as f:
            usage_data = json.load(f)

        # Return the raw data - frontend will process it
        return jsonify({
            'success': True,
            'company': company,
            'data': usage_data.get('data', []),
            'metadata': usage_data.get('metadata', {})
        })

    except Exception as e:
        print(f"Error in get_usage_data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'trace': traceback.format_exc()
        }), 500


if __name__ == '__main__':
    PORT = int(os.getenv('PORT', 5001))
    HOST = os.getenv('HOST', '0.0.0.0')

    print("\n" + "="*70)
    print("🚀 Starting Claude ROI Insight API")
    print("="*70)
    print(f"📂 Data directory: {DATA_DIR}")
    print(f"🌐 Host: {HOST}")
    print(f"🔌 Port: {PORT}")
    print(f"🔗 Local URL: http://localhost:{PORT}")
    print(f"🔗 Network URL: http://{HOST}:{PORT}")
    print(f"📋 Health check: http://localhost:{PORT}/api/health")
    print(f"🔧 Environment: {'Development' if app.debug else 'Production'}")
    print("="*70 + "\n")

    app.run(debug=True, host=HOST, port=PORT)
