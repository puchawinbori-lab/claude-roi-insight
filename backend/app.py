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

# Data storage paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

JIRA_EXPORT_PATH = os.path.join(DATA_DIR, 'jira_export.csv')
PROCESSED_DATA_PATH = os.path.join(DATA_DIR, 'processed_data.csv')


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Claude ROI API is running'})


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


if __name__ == '__main__':
    print("Starting Claude ROI Insight API...")
    print(f"Data directory: {DATA_DIR}")
    app.run(debug=True, host='0.0.0.0', port=5001)
