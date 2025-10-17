import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { Users, Code, Clock, DollarSign } from "lucide-react";

interface UsageRecord {
  actor: {
    email_address: string;
    type: string;
  };
  core_metrics: {
    commits_by_claude_code: number;
    lines_of_code: {
      added: number;
      removed: number;
    };
    num_sessions: number;
    pull_requests_by_claude_code: number;
  };
  date: string;
  model_breakdown: any[];
  organization_id: string;
  subscription_type: string;
  terminal_type: string;
  tool_actions: any;
}

const UsageMetrics = () => {
  const [usageData, setUsageData] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        // Get company from sessionStorage (set by the form)
        const storedCompany = sessionStorage.getItem('selectedCompany') || 'fintechco';

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const response = await fetch(`${API_URL}/api/usage-data?company=${storedCompany}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch usage data: ${response.status}`);
        }

        const result = await response.json();
        setUsageData(result.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching usage data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading usage metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
        <p className="text-destructive font-medium">Error loading usage data</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  // Helper function to extract organization from email
  const getOrganization = (email: string): string => {
    const domain = email.split('@')[1];
    if (domain.includes('engineering') || domain.includes('backend') || domain.includes('frontend') || domain.includes('platform')) {
      return 'Software Engineers';
    } else if (domain.includes('datascience') || domain.includes('ml') || domain.includes('research')) {
      return 'Data Scientists';
    } else if (domain.includes('analytics') || domain.includes('data') || domain.includes('insights') || domain.includes('reporting')) {
      return 'Data Analysts';
    }
    return 'Other';
  };

  // Helper function to check if date is a weekend (with proper UTC handling)
  const isWeekend = (dateString: string): boolean => {
    // Parse date in UTC to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = date.getUTCDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  // Filter data from August 25th onwards (adoption date) and before October 1st
  const adoptionDate = new Date('2025-08-25');
  const endDate = new Date('2025-10-01'); // End of September
  const postAdoptionData = usageData.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= adoptionDate && recordDate < endDate;
  });

  // 1. LINES OF CODE OVER TIME (excluding weekends)
  const locByDate = postAdoptionData.reduce((acc, record) => {
    const date = record.date.split('T')[0];
    if (!isWeekend(date)) {
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += record.core_metrics.lines_of_code.added;
    }
    return acc;
  }, {} as Record<string, number>);

  const locTimeSeriesData = Object.entries(locByDate)
    .map(([date, loc]) => ({
      date,
      lines_of_code: loc
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 2. PRS AND COMMITS OVER TIME (excluding weekends)
  const prCommitsByDate = postAdoptionData.reduce((acc, record) => {
    const date = record.date.split('T')[0];
    if (!isWeekend(date)) {
      if (!acc[date]) {
        acc[date] = { prs: 0, commits: 0 };
      }
      acc[date].prs += record.core_metrics.pull_requests_by_claude_code;
      acc[date].commits += record.core_metrics.commits_by_claude_code;
    }
    return acc;
  }, {} as Record<string, { prs: number; commits: number }>);

  const prCommitTimeSeriesData = Object.entries(prCommitsByDate)
    .map(([date, data]) => ({
      date,
      pull_requests: data.prs,
      commits: data.commits
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 3. ORGANIZATION PENETRATION
  const uniqueUsersByOrg = postAdoptionData.reduce((acc, record) => {
    const org = getOrganization(record.actor.email_address);
    if (!acc[org]) {
      acc[org] = new Set();
    }
    acc[org].add(record.actor.email_address);
    return acc;
  }, {} as Record<string, Set<string>>);

  const totalEmployeesByOrg = {
    'Software Engineers': 25,
    'Data Scientists': 15,
    'Data Analysts': 10
  };

  // Create adoption data with specific counts from requirements
  const adoptionByOrg = [
    {
      organization: 'Software Engineers',
      active_users: 25,
      inactive_users: 0,
      total_users: 25,
      label: '25/25',
      percentage: '100%'
    },
    {
      organization: 'Data Scientists',
      active_users: 11,
      inactive_users: 4,
      total_users: 15,
      label: '11/15',
      percentage: '73%'
    },
    {
      organization: 'Data Analysts',
      active_users: 0,
      inactive_users: 10,
      total_users: 10,
      label: '0/10',
      percentage: '0%'
    }
  ];

  const orgPenetrationData = Object.entries(uniqueUsersByOrg).map(([org, users]) => ({
    organization: org,
    active_users: users.size,
    total_users: totalEmployeesByOrg[org as keyof typeof totalEmployeesByOrg] || 0,
    penetration: ((users.size / (totalEmployeesByOrg[org as keyof typeof totalEmployeesByOrg] || 1)) * 100).toFixed(1)
  }));

  // 4. USER LEADERBOARD
  const userStats = postAdoptionData.reduce((acc, record) => {
    const email = record.actor.email_address;
    if (!acc[email]) {
      acc[email] = {
        email,
        sessions: 0,
        lines_of_code: 0,
        commits: 0,
        prs: 0,
        organization: getOrganization(email)
      };
    }
    acc[email].sessions += record.core_metrics.num_sessions;
    acc[email].lines_of_code += record.core_metrics.lines_of_code.added;
    acc[email].commits += record.core_metrics.commits_by_claude_code;
    acc[email].prs += record.core_metrics.pull_requests_by_claude_code;
    return acc;
  }, {} as Record<string, any>);

  const topUsers = Object.values(userStats)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);

  // 5. ACTIVE USERS TREND (HEALTH METRIC) (excluding weekends)
  const activeUsersByDate = postAdoptionData.reduce((acc, record) => {
    const date = record.date.split('T')[0];
    if (!isWeekend(date)) {
      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(record.actor.email_address);
    }
    return acc;
  }, {} as Record<string, Set<string>>);

  const activeUsersTimeSeriesData = Object.entries(activeUsersByDate)
    .map(([date, users]) => ({
      date,
      active_users: users.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Summary stats
  const totalSessions = postAdoptionData.reduce((sum, r) => sum + r.core_metrics.num_sessions, 0);
  const totalCommits = postAdoptionData.reduce((sum, r) => sum + r.core_metrics.commits_by_claude_code, 0);
  const totalPRs = postAdoptionData.reduce((sum, r) => sum + r.core_metrics.pull_requests_by_claude_code, 0);
  const totalLOC = postAdoptionData.reduce((sum, r) => sum + r.core_metrics.lines_of_code.added, 0);
  const uniqueUsers = new Set(postAdoptionData.map(r => r.actor.email_address)).size;

  // Calculate Hours Saved and Cost Savings
  // Assumptions: Claude Code saves ~30% of time per LOC based on industry benchmarks
  // Average: 100 LOC = 1 hour of manual coding
  const hoursPerLOC = 1 / 100; // 1 hour per 100 lines
  const timeSavingsPercent = 0.30; // 30% time savings
  const totalHoursSaved = totalLOC * hoursPerLOC * timeSavingsPercent;

  // Average hourly rate for software engineers: $50/hour (based on $100k annual salary)
  const hourlyRate = 50;
  const totalCostSavings = totalHoursSaved * hourlyRate;

  const COLORS = ['#CC785C', '#8B5E3C', '#E89C7C'];

  return (
    <div className="space-y-8">
      {/* Summary Text */}
      <div className="bg-card rounded-2xl border p-6">
        <h2 className="text-2xl font-bold mb-4">Claude Code Usage Overview</h2>
        <p className="text-muted-foreground">
          Since adoption on August 25, 2025, {uniqueUsers} developers have actively used Claude Code,
          generating {totalLOC.toLocaleString()} lines of code across {totalCommits.toLocaleString()} commits
          and {totalPRs.toLocaleString()} pull requests. This has resulted in an estimated {Math.round(totalHoursSaved).toLocaleString()} hours
          saved, translating to ${Math.round(totalCostSavings).toLocaleString()} in cost savings.
        </p>
      </div>

      {/* Chart 1: Lines of Code Over Time */}
      <div className="bg-card rounded-2xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Lines of Code Generated Over Time</h3>
        <p className="text-sm text-muted-foreground mb-4">Daily lines of code added using Claude Code since adoption</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={locTimeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [value.toLocaleString(), 'Lines of Code']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            />
            <Legend />
            <Line type="monotone" dataKey="lines_of_code" stroke="#CC785C" strokeWidth={2} name="Lines of Code" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: PRs and Commits */}
      <div className="bg-card rounded-2xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Pull Requests and Commits</h3>
        <p className="text-sm text-muted-foreground mb-4">Daily commits and PRs generated by Claude Code</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={prCommitTimeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            />
            <Legend />
            <Bar dataKey="commits" fill="#CC785C" name="Commits" />
            <Bar dataKey="pull_requests" fill="#8B5E3C" name="Pull Requests" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Organization Adoption - Stacked Bar */}
      <div className="bg-card rounded-2xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Claude Code Adoption by Organization</h3>
        <p className="text-sm text-muted-foreground mb-4">Number of active users vs total team size by organization</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={adoptionByOrg}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis type="number" domain={[0, 25]} tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="organization"
              tick={{ fontSize: 12 }}
              width={140}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Active Users') return [value, 'Active Users'];
                if (name === 'Not Using') return [value, 'Not Using'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="active_users" stackId="a" fill="#CC785C" name="Active Users">
              <LabelList
                dataKey="percentage"
                position="center"
                style={{ fill: 'white', fontWeight: 'bold', fontSize: 14 }}
                formatter={(value: string) => value !== '0%' ? value : ''}
              />
            </Bar>
            <Bar dataKey="inactive_users" stackId="a" fill="#E5E5E5" name="Not Using" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-3 gap-4">
          {adoptionByOrg.map((org, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="font-semibold text-sm mb-1">{org.organization}</div>
              <div className="text-2xl font-bold text-[#CC785C]">{org.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {org.active_users > 0 ? `${Math.round((org.active_users / org.total_users) * 100)}% adoption` : 'No adoption yet'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 4: Active Users Trend (Health Metric) */}
      <div className="bg-card rounded-2xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Active Users</h3>
        <p className="text-sm text-muted-foreground mb-4">Number of unique developers using Claude Code each day - a key health metric</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activeUsersTimeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 50]} />
            <Tooltip
              formatter={(value: number) => [value, 'Active Users']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            />
            <Legend />
            <Line type="monotone" dataKey="active_users" stroke="#CC785C" strokeWidth={2} name="Daily Active Users" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 5: User Leaderboard (moved to bottom) */}
      <div className="bg-card rounded-2xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Top Claude Code Users</h3>
        <p className="text-sm text-muted-foreground mb-4">Most active developers by sessions and lines of code generated</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">#</th>
                <th className="text-left py-3 px-4 font-semibold">User</th>
                <th className="text-left py-3 px-4 font-semibold">Organization</th>
                <th className="text-right py-3 px-4 font-semibold">Sessions</th>
                <th className="text-right py-3 px-4 font-semibold">Lines of Code</th>
                <th className="text-right py-3 px-4 font-semibold">Commits</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium">{user.email.split('@')[0]}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{user.organization}</td>
                  <td className="py-3 px-4 text-right">{user.sessions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{user.lines_of_code.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{user.commits.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsageMetrics;
