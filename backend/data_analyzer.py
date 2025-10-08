"""
Data Analyzer for Claude Code ROI Calculations
Analyzes JIRA data to calculate productivity improvements and cost savings
"""

import pandas as pd
from datetime import datetime
from typing import Dict, List, Any
import json


class ROIAnalyzer:
    """Analyzes JIRA task data to calculate ROI metrics for Claude Code adoption"""

    # Assumptions
    ENGINEER_COST = 100000  # Annual cost per engineer
    HOURS_PER_DAY = 8
    WORKING_DAYS_PER_YEAR = 250
    HOURLY_RATE = ENGINEER_COST / (HOURS_PER_DAY * WORKING_DAYS_PER_YEAR)  # $50/hour

    def __init__(self, csv_path: str, claude_adoption_date: str):
        """
        Initialize analyzer with JIRA export data

        Args:
            csv_path: Path to JIRA export CSV
            claude_adoption_date: Date when Claude Code was adopted (format: YYYY-MM-DD or dd/MMM/yy)
        """
        self.df = pd.read_csv(csv_path)
        self.claude_adoption_date = self._parse_date(claude_adoption_date)
        self._process_data()

    def _parse_date(self, date_str: str) -> datetime:
        """Parse date from various formats"""
        # Try YYYY-MM-DD format first
        try:
            return datetime.strptime(date_str, '%Y-%m-%d')
        except:
            pass

        # Try dd/MMM/yy format (JIRA format)
        try:
            return datetime.strptime(date_str, '%d/%b/%y')
        except:
            pass

        # Try dd/MMM/yy with time
        try:
            return datetime.strptime(date_str.split()[0], '%d/%b/%y')
        except:
            raise ValueError(f"Unable to parse date: {date_str}")

    def _process_data(self):
        """Process and clean the JIRA data"""
        # Parse dates
        self.df['Created_dt'] = self.df['Created'].apply(lambda x: self._parse_date(x) if pd.notna(x) else None)
        self.df['Due_date_dt'] = self.df['Due date'].apply(lambda x: self._parse_date(x) if pd.notna(x) else None)
        self.df['Start_date_dt'] = self.df['Custom field (Start date)'].apply(lambda x: self._parse_date(x) if pd.notna(x) else None)
        self.df['Updated_dt'] = self.df['Updated'].apply(lambda x: self._parse_date(x) if pd.notna(x) else None)

        # Calculate hours per ticket (Due Date - Start Date) * 8 hours/day
        self.df['Duration_days'] = (self.df['Due_date_dt'] - self.df['Start_date_dt']).dt.days
        self.df['Hours_per_ticket'] = self.df['Duration_days'] * self.HOURS_PER_DAY

        # Calculate cost per ticket
        self.df['Cost_per_ticket'] = self.df['Hours_per_ticket'] * self.HOURLY_RATE

        # Classify pre/post Claude adoption
        self.df['Period'] = self.df['Created_dt'].apply(
            lambda x: 'Post-Claude' if pd.notna(x) and x >= self.claude_adoption_date else 'Pre-Claude'
        )

        # Filter out invalid rows (negative duration)
        self.df = self.df[self.df['Duration_days'] >= 0]

    def get_summary_metrics(self) -> Dict[str, Any]:
        """Calculate summary ROI metrics"""

        pre_claude = self.df[self.df['Period'] == 'Pre-Claude']
        post_claude = self.df[self.df['Period'] == 'Post-Claude']

        # Calculate metrics
        pre_avg_hours = pre_claude['Hours_per_ticket'].mean() if len(pre_claude) > 0 else 0
        post_avg_hours = post_claude['Hours_per_ticket'].mean() if len(post_claude) > 0 else 0

        pre_avg_days = pre_claude['Duration_days'].mean() if len(pre_claude) > 0 else 0
        post_avg_days = post_claude['Duration_days'].mean() if len(post_claude) > 0 else 0

        pre_total_tasks = len(pre_claude)
        post_total_tasks = len(post_claude)

        pre_completed = len(pre_claude[pre_claude['Status'] == 'Done'])
        post_completed = len(post_claude[post_claude['Status'] == 'Done'])

        pre_completion_rate = (pre_completed / pre_total_tasks * 100) if pre_total_tasks > 0 else 0
        post_completion_rate = (post_completed / post_total_tasks * 100) if post_total_tasks > 0 else 0

        # Calculate improvements
        time_savings_percent = ((pre_avg_hours - post_avg_hours) / pre_avg_hours * 100) if pre_avg_hours > 0 else 0
        speed_improvement = ((pre_avg_days - post_avg_days) / pre_avg_days * 100) if pre_avg_days > 0 else 0

        # Calculate cost savings
        pre_total_cost = pre_claude['Cost_per_ticket'].sum()
        post_total_cost = post_claude['Cost_per_ticket'].sum()

        # Normalized cost per task
        pre_cost_per_task = pre_claude['Cost_per_ticket'].mean() if len(pre_claude) > 0 else 0
        post_cost_per_task = post_claude['Cost_per_ticket'].mean() if len(post_claude) > 0 else 0

        cost_savings_per_task = pre_cost_per_task - post_cost_per_task
        cost_savings_percent = ((cost_savings_per_task / pre_cost_per_task) * 100) if pre_cost_per_task > 0 else 0

        # Estimate annual savings
        # Assume post-Claude velocity continues
        if post_total_tasks > 0 and len(post_claude) > 0:
            # Calculate days of data post-Claude
            post_dates = post_claude['Created_dt'].dropna()
            if len(post_dates) > 0:
                days_post_claude = (post_dates.max() - self.claude_adoption_date).days
                if days_post_claude > 0:
                    tasks_per_day_post = post_total_tasks / days_post_claude
                    annual_tasks_projected = tasks_per_day_post * 365
                    annual_savings_estimate = annual_tasks_projected * cost_savings_per_task
                else:
                    annual_savings_estimate = 0
            else:
                annual_savings_estimate = 0
        else:
            annual_savings_estimate = 0

        return {
            'assumptions': {
                'engineer_annual_cost': self.ENGINEER_COST,
                'hours_per_day': self.HOURS_PER_DAY,
                'hourly_rate': round(self.HOURLY_RATE, 2)
            },
            'pre_claude': {
                'total_tasks': int(pre_total_tasks),
                'completed_tasks': int(pre_completed),
                'completion_rate': round(pre_completion_rate, 1),
                'avg_hours_per_task': round(pre_avg_hours, 1),
                'avg_days_per_task': round(pre_avg_days, 1),
                'avg_cost_per_task': round(pre_cost_per_task, 2),
                'total_cost': round(pre_total_cost, 2)
            },
            'post_claude': {
                'total_tasks': int(post_total_tasks),
                'completed_tasks': int(post_completed),
                'completion_rate': round(post_completion_rate, 1),
                'avg_hours_per_task': round(post_avg_hours, 1),
                'avg_days_per_task': round(post_avg_days, 1),
                'avg_cost_per_task': round(post_cost_per_task, 2),
                'total_cost': round(post_total_cost, 2)
            },
            'improvements': {
                'time_savings_percent': round(time_savings_percent, 1),
                'speed_improvement_percent': round(speed_improvement, 1),
                'cost_savings_per_task': round(cost_savings_per_task, 2),
                'cost_savings_percent': round(cost_savings_percent, 1),
                'completion_rate_improvement': round(post_completion_rate - pre_completion_rate, 1),
                'annual_savings_estimate': round(annual_savings_estimate, 2)
            },
            'claude_adoption_date': self.claude_adoption_date.strftime('%Y-%m-%d')
        }

    def get_time_series_data(self) -> List[Dict[str, Any]]:
        """Get time series data for charts"""
        # Group by week and get the week start date
        self.df['Week_Period'] = self.df['Created_dt'].dt.to_period('W')
        self.df['Week_Start'] = self.df['Week_Period'].apply(lambda x: x.start_time.strftime('%Y-%m-%d'))

        weekly_stats = self.df.groupby(['Week_Start', 'Period']).agg({
            'Hours_per_ticket': 'mean',
            'Duration_days': 'mean',
            'Issue key': 'count',
            'Cost_per_ticket': 'mean'
        }).reset_index()

        weekly_stats.columns = ['Week_Start', 'Period', 'Avg_Hours_Per_Task', 'Avg_Days', 'Task_Count', 'Avg_Cost']

        # Calculate Total_Hours for each week
        weekly_stats['Total_Hours'] = weekly_stats['Avg_Hours_Per_Task'] * weekly_stats['Task_Count']

        result = weekly_stats.to_dict('records')
        print(f"\n📊 TIME SERIES DATA ({len(result)} records):")
        if result:
            print(f"   First record: {result[0]}")
            if len(result) > 1:
                print(f"   Last record: {result[-1]}")

        return result

    def get_status_breakdown(self) -> Dict[str, Any]:
        """Get breakdown by status for pre/post Claude"""
        status_breakdown = self.df.groupby(['Period', 'Status']).size().unstack(fill_value=0)

        return {
            'pre_claude': status_breakdown.loc['Pre-Claude'].to_dict() if 'Pre-Claude' in status_breakdown.index else {},
            'post_claude': status_breakdown.loc['Post-Claude'].to_dict() if 'Post-Claude' in status_breakdown.index else {}
        }

    def get_priority_breakdown(self) -> Dict[str, Any]:
        """Get breakdown by priority for pre/post Claude"""
        priority_breakdown = self.df.groupby(['Period', 'Priority']).size().unstack(fill_value=0)

        return {
            'pre_claude': priority_breakdown.loc['Pre-Claude'].to_dict() if 'Pre-Claude' in priority_breakdown.index else {},
            'post_claude': priority_breakdown.loc['Post-Claude'].to_dict() if 'Post-Claude' in priority_breakdown.index else {}
        }

    def export_processed_data(self, output_path: str):
        """Export processed DataFrame to CSV"""
        self.df.to_csv(output_path, index=False)
