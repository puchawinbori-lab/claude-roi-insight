# jira_api_client.py
import requests
from requests.auth import HTTPBasicAuth
import json
import csv
from datetime import datetime
import os
from typing import List, Dict, Optional

class JiraAPIClient:
    """
    JIRA API Client for pulling task data from JIRA Cloud or Server
    """

    def __init__(self, jira_url: str, email: str, api_token: str):
        """
        Initialize JIRA API client

        Args:
            jira_url: Your JIRA instance URL (e.g., 'https://yourcompany.atlassian.net')
            email: Your JIRA account email
            api_token: Your JIRA API token (generate from: Account Settings > Security > API Tokens)
        """
        self.jira_url = jira_url.rstrip('/')
        self.auth = HTTPBasicAuth(email, api_token)
        self.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

    def test_connection(self) -> bool:
        """Test the connection to JIRA"""
        try:
            test_url = f'{self.jira_url}/rest/api/3/myself'
            print(f"\n🔍 Testing connection to: {test_url}")
            print(f"   Auth: {self.auth.username}")

            response = requests.get(
                test_url,
                headers=self.headers,
                auth=self.auth,
                timeout=10
            )

            print(f"   Response status: {response.status_code}")

            if response.status_code == 200:
                user_data = response.json()
                print(f"✅ Connected to JIRA as: {user_data.get('displayName', 'Unknown')}")
                return True
            else:
                print(f"❌ Connection failed: {response.status_code}")
                print(f"   Response text: {response.text[:200]}")
                return False
        except Exception as e:
            print(f"❌ Connection error: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"   Traceback: {traceback.format_exc()[:500]}")
            return False

    def get_projects(self) -> List[Dict]:
        """Retrieve all accessible projects"""
        try:
            response = requests.get(
                f'{self.jira_url}/rest/api/3/project',
                headers=self.headers,
                auth=self.auth
            )

            if response.status_code == 200:
                projects = response.json()
                print(f"\n📁 Found {len(projects)} projects:")
                for project in projects[:10]:  # Show first 10
                    print(f"  • {project['key']}: {project['name']}")
                return projects
            else:
                print(f"❌ Failed to get projects: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error getting projects: {str(e)}")
            return []

    def search_issues(self, jql: str, max_results: int = 100, start_at: int = 0) -> Dict:
        """
        Search for issues using JQL (JIRA Query Language)

        Args:
            jql: JQL query string (e.g., 'project = PROJ AND status = Done')
            max_results: Maximum number of results to return (max 100 per request)
            start_at: Starting index for pagination

        Returns:
            Dict containing issues and metadata
        """
        try:
            # Use GET with search/jql endpoint (correct API v3 format)
            params = {
                'jql': jql,
                'startAt': start_at,
                'maxResults': max_results,
                'fields': 'issuetype,summary,description,assignee,reporter,priority,status,resolution,created,updated,duedate,customfield_10015'
            }

            response = requests.get(
                f'{self.jira_url}/rest/api/3/search/jql',
                headers=self.headers,
                auth=self.auth,
                params=params
            )

            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Search failed: {response.status_code} - {response.text}")
                return {'issues': [], 'total': 0}
        except Exception as e:
            print(f"❌ Search error: {str(e)}")
            return {'issues': [], 'total': 0}

    def get_all_issues(self, jql: str, max_total: Optional[int] = None) -> List[Dict]:
        """
        Retrieve all issues matching a JQL query (handles pagination with nextPageToken)

        Args:
            jql: JQL query string
            max_total: Maximum total issues to retrieve (None for all)

        Returns:
            List of all issues
        """
        all_issues = []
        next_page_token = None
        batch_size = 100

        print(f"\n🔍 Searching JIRA with query: {jql}")

        while True:
            # Use nextPageToken for pagination if available
            if next_page_token:
                result = self.search_issues_with_token(jql, max_results=batch_size, page_token=next_page_token)
            else:
                result = self.search_issues(jql, max_results=batch_size, start_at=0)

            issues = result.get('issues', [])
            is_last = result.get('isLast', True)
            next_page_token = result.get('nextPageToken')

            if not issues:
                break

            all_issues.extend(issues)
            print(f"  Retrieved {len(all_issues)} issues... (isLast: {is_last})")

            # Check if this is the last page
            if is_last or not next_page_token:
                break

            if max_total and len(all_issues) >= max_total:
                all_issues = all_issues[:max_total]
                break

        print(f"✅ Total issues retrieved: {len(all_issues)}")
        return all_issues

    def search_issues_with_token(self, jql: str, max_results: int = 100, page_token: str = None) -> Dict:
        """
        Search for issues using nextPageToken for pagination

        Args:
            jql: JQL query string
            max_results: Maximum number of results per page
            page_token: Next page token from previous response

        Returns:
            Dict containing issues and metadata
        """
        try:
            params = {
                'jql': jql,
                'maxResults': max_results,
                'fields': 'issuetype,summary,description,assignee,reporter,priority,status,resolution,created,updated,duedate,customfield_10015'
            }

            if page_token:
                params['nextPageToken'] = page_token

            response = requests.get(
                f'{self.jira_url}/rest/api/3/search/jql',
                headers=self.headers,
                auth=self.auth,
                params=params
            )

            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Search failed: {response.status_code} - {response.text}")
                return {'issues': [], 'isLast': True}
        except Exception as e:
            print(f"❌ Search error: {str(e)}")
            return {'issues': [], 'isLast': True}

    def export_to_csv(self, issues: List[Dict], filename: str = 'jira_export.csv'):
        """
        Export issues to CSV format

        Args:
            issues: List of JIRA issues
            filename: Output CSV filename
        """
        if not issues:
            print("❌ No issues to export")
            return

        # Define CSV columns (matching your template)
        columns = [
            'Issue Type',
            'Issue key',
            'Issue id',
            'Summary',
            'Description',
            'Assignee',
            'Assignee Id',
            'Reporter',
            'Reporter Id',
            'Priority',
            'Status',
            'Resolution',
            'Created',
            'Updated',
            'Due date',
            'Custom field (Start date)'
        ]

        rows = []

        for issue in issues:
            fields = issue.get('fields', {})

            # Extract assignee info
            assignee = fields.get('assignee', {}) or {}
            assignee_name = assignee.get('displayName', 'Unassigned')
            assignee_id = assignee.get('accountId', '')

            # Extract reporter info
            reporter = fields.get('reporter', {}) or {}
            reporter_name = reporter.get('displayName', '')
            reporter_id = reporter.get('accountId', '')

            # Format dates
            created = fields.get('created', '')
            if created:
                created = self._format_jira_date(created)

            updated = fields.get('updated', '')
            if updated:
                updated = self._format_jira_date(updated)

            due_date = fields.get('duedate', '')
            if due_date:
                due_date = self._format_jira_date(due_date, include_time=True)

            # Look for custom start date field (customfield_10015 for this JIRA instance)
            start_date = ''
            start_date_value = fields.get('customfield_10015', '')
            if start_date_value:
                start_date = self._format_jira_date(start_date_value, include_time=True)

            row = {
                'Issue Type': fields.get('issuetype', {}).get('name', ''),
                'Issue key': issue.get('key', ''),
                'Issue id': issue.get('id', ''),
                'Summary': fields.get('summary', ''),
                'Description': fields.get('description', ''),
                'Assignee': assignee_name,
                'Assignee Id': assignee_id,
                'Reporter': reporter_name,
                'Reporter Id': reporter_id,
                'Priority': fields.get('priority', {}).get('name', ''),
                'Status': fields.get('status', {}).get('name', ''),
                'Resolution': fields.get('resolution', {}).get('name', '') if fields.get('resolution') else '',
                'Created': created,
                'Updated': updated,
                'Due date': due_date,
                'Custom field (Start date)': start_date
            }

            rows.append(row)

        # Write to CSV
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=columns)
            writer.writeheader()
            writer.writerows(rows)

        print(f"✅ Exported {len(rows)} issues to {filename}")

    def _format_jira_date(self, date_string: str, include_time: bool = True) -> str:
        """Format JIRA date to dd/MMM/yy h:mm a format"""
        try:
            # JIRA typically returns ISO format: 2025-07-01T14:30:00.000+0000
            dt = datetime.fromisoformat(date_string.replace('Z', '+00:00').split('.')[0])

            if include_time:
                return dt.strftime('%d/%b/%y %I:%M %p')
            else:
                return dt.strftime('%d/%b/%y')
        except:
            return date_string

    def get_custom_fields(self) -> List[Dict]:
        """Get all custom fields in JIRA"""
        try:
            response = requests.get(
                f'{self.jira_url}/rest/api/3/field',
                headers=self.headers,
                auth=self.auth
            )

            if response.status_code == 200:
                all_fields = response.json()
                custom_fields = [f for f in all_fields if f.get('custom', False)]

                print(f"\n🔧 Custom Fields ({len(custom_fields)}):")
                for field in custom_fields[:15]:  # Show first 15
                    print(f"  • {field['id']}: {field['name']}")

                return custom_fields
            else:
                print(f"❌ Failed to get custom fields: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Error getting custom fields: {str(e)}")
            return []


def main():
    """
    Example usage of JiraAPIClient
    """

    print("=" * 70)
    print("🔧 JIRA API CLIENT - Pull Data from JIRA")
    print("=" * 70)

    # Configuration (use environment variables for security)
    JIRA_URL = os.getenv('JIRA_URL', 'https://puchawinbori.atlassian.net')
    JIRA_EMAIL = os.getenv('JIRA_EMAIL', 'puchawinbori@gmail.com')
    JIRA_API_TOKEN = os.getenv('JIRA_API_TOKEN', 'your-api-token-here')

    print("\n⚙️  Configuration:")
    print(f"  JIRA URL: {JIRA_URL}")
    print(f"  Email: {JIRA_EMAIL}")
    print(f"  API Token: {'*' * len(JIRA_API_TOKEN[:4]) + JIRA_API_TOKEN[:4] if JIRA_API_TOKEN != 'your-api-token-here' else 'NOT SET'}")

    # Initialize client
    client = JiraAPIClient(JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN)

    # Test connection
    print("\n" + "─" * 70)
    print("Testing connection...")
    print("─" * 70)

    if not client.test_connection():
        print("\n⚠️  Please configure your JIRA credentials:")
        print("  1. Set environment variables:")
        print("     export JIRA_URL='https://yourcompany.atlassian.net'")
        print("     export JIRA_EMAIL='your-email@company.com'")
        print("     export JIRA_API_TOKEN='your-token'")
        print("\n  2. Or edit the configuration in this script")
        print("\n  📖 Generate API token: https://id.atlassian.com/manage-profile/security/api-tokens")
        return

    # Get projects
    print("\n" + "─" * 70)
    print("Fetching projects...")
    print("─" * 70)
    projects = client.get_projects()

    # Get custom fields (useful for finding Start Date field)
    print("\n" + "─" * 70)
    print("Fetching custom fields...")
    print("─" * 70)
    custom_fields = client.get_custom_fields()

    # Example: Search for tasks in a specific project
    print("\n" + "─" * 70)
    print("Example: Searching for issues...")
    print("─" * 70)

    # Pull all tasks from SCRUM project
    jql_query = 'project = SCRUM ORDER BY created DESC'

    print(f"\n📥 Pulling all issues from SCRUM project...")

    # Fetch issues (no max limit - get all)
    issues = client.get_all_issues(jql_query)

    if issues:
        client.export_to_csv(issues, 'jira_real_data_export.csv')
    else:
        print("⚠️  No issues found in SCRUM project")

    print("\n" + "=" * 70)
    print("✅ JIRA API Client ready to use!")
    print("=" * 70)


if __name__ == '__main__':
    main()
