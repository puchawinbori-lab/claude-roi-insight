import { useEffect, useState } from "react";
import { Download, TrendingUp, DollarSign, Clock, Award, AlertCircle, LineChart, BarChart, Edit2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MetricCard from "@/components/dashboard/MetricCard";
import ProductivityChart from "@/components/dashboard/ProductivityChart";
import SavingsChart from "@/components/dashboard/SavingsChart";
import TasksCompletedChart from "@/components/dashboard/TasksCompletedChart";
import HoursPerTicketChart from "@/components/dashboard/HoursPerTicketChart";
import TotalTicketsChart from "@/components/dashboard/TotalTicketsChart";
import DataSourceInfo from "@/components/dashboard/DataSourceInfo";
import UsageMetrics from "@/components/dashboard/UsageMetrics";
import HealthScore from "@/components/dashboard/HealthScore";

interface SummaryMetrics {
  assumptions: {
    engineer_annual_cost: number;
    hours_per_day: number;
    hourly_rate: number;
  };
  pre_claude: {
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
    avg_hours_per_task: number;
    avg_days_per_task: number;
    avg_cost_per_task: number;
    total_cost: number;
  };
  post_claude: {
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
    avg_hours_per_task: number;
    avg_days_per_task: number;
    avg_cost_per_task: number;
    total_cost: number;
  };
  improvements: {
    time_savings_percent: number;
    speed_improvement_percent: number;
    cost_savings_per_task: number;
    cost_savings_percent: number;
    completion_rate_improvement: number;
    annual_savings_estimate: number;
  };
  claude_adoption_date: string;
}

interface DashboardData {
  success: boolean;
  summary_metrics: SummaryMetrics;
  time_series_data: any[];
  status_breakdown: any;
  priority_breakdown: any;
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("FinTechCo");

  const [animatedMetrics, setAnimatedMetrics] = useState({
    timeSavings: 0,
    hoursSaved: 0,
    costSavings: 0,
    annualSavings: 0,
  });

  const [selectedChart, setSelectedChart] = useState<"savings" | "productivity" | "usage">("usage");
  const [isEditingAssumptions, setIsEditingAssumptions] = useState(false);
  const [customEngineerCost, setCustomEngineerCost] = useState<number | null>(null);
  const [showMetricModal, setShowMetricModal] = useState<string | null>(null);

  useEffect(() => {
    // Try to load data from sessionStorage
    const storedData = sessionStorage.getItem("dashboardData");
    const storedCompany = sessionStorage.getItem("selectedCompany");

    if (storedData) {
      try {
        const data: DashboardData = JSON.parse(storedData);
        setDashboardData(data);
        setLoading(false);

        // Set company name
        if (storedCompany) {
          const companyName = storedCompany === 'fintechco' ? 'FinTechCo' : 'PharmaCo';
          setSelectedCompany(companyName);
        }

        // Start animation after data is loaded
        animateMetrics(data.summary_metrics);
      } catch (err) {
        setError("Failed to parse dashboard data");
        setLoading(false);
      }
    } else {
      setError("No data available. Please submit the form first.");
      setLoading(false);
    }
  }, []);

  const recalculateMetrics = (newEngineerCost: number) => {
    if (!dashboardData) return;

    const HOURS_PER_DAY = 8;
    const WORKING_DAYS_PER_YEAR = 250;
    const newHourlyRate = newEngineerCost / (HOURS_PER_DAY * WORKING_DAYS_PER_YEAR);

    // Recalculate costs using new hourly rate
    const preClaudeAvgCost = dashboardData.summary_metrics.pre_claude.avg_hours_per_task * newHourlyRate;
    const postClaudeAvgCost = dashboardData.summary_metrics.post_claude.avg_hours_per_task * newHourlyRate;
    const costSavingsPerTask = preClaudeAvgCost - postClaudeAvgCost;
    const costSavingsPercent = (costSavingsPerTask / preClaudeAvgCost) * 100;

    // Calculate annual savings estimate
    const postClaudeDays = dashboardData.summary_metrics.post_claude.total_tasks * dashboardData.summary_metrics.post_claude.avg_days_per_task;
    const tasksPerDay = dashboardData.summary_metrics.post_claude.total_tasks / postClaudeDays;
    const annualTasksProjected = tasksPerDay * 365;
    const annualSavingsEstimate = annualTasksProjected * costSavingsPerTask;

    // Update dashboard data with new calculations
    const updatedData = {
      ...dashboardData,
      summary_metrics: {
        ...dashboardData.summary_metrics,
        assumptions: {
          ...dashboardData.summary_metrics.assumptions,
          engineer_annual_cost: newEngineerCost,
          hourly_rate: newHourlyRate,
        },
        pre_claude: {
          ...dashboardData.summary_metrics.pre_claude,
          avg_cost_per_task: preClaudeAvgCost,
          total_cost: preClaudeAvgCost * dashboardData.summary_metrics.pre_claude.total_tasks,
        },
        post_claude: {
          ...dashboardData.summary_metrics.post_claude,
          avg_cost_per_task: postClaudeAvgCost,
          total_cost: postClaudeAvgCost * dashboardData.summary_metrics.post_claude.total_tasks,
        },
        improvements: {
          ...dashboardData.summary_metrics.improvements,
          cost_savings_per_task: costSavingsPerTask,
          cost_savings_percent: costSavingsPercent,
          annual_savings_estimate: annualSavingsEstimate,
        },
      },
    };

    setDashboardData(updatedData);
    animateMetrics(updatedData.summary_metrics);
  };

  const handleSaveAssumptions = () => {
    if (customEngineerCost && customEngineerCost > 0) {
      recalculateMetrics(customEngineerCost);
      setIsEditingAssumptions(false);
    }
  };

  const animateMetrics = (metrics: SummaryMetrics) => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      timeSavings: metrics.improvements.time_savings_percent,
      hoursSaved: (metrics.pre_claude.avg_hours_per_task - metrics.post_claude.avg_hours_per_task) * metrics.post_claude.total_tasks,
      costSavings: metrics.improvements.cost_savings_per_task * metrics.post_claude.total_tasks,
      annualSavings: (metrics.improvements.cost_savings_per_task * metrics.post_claude.total_tasks) * 4,
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedMetrics({
        timeSavings: targets.timeSavings * progress,
        hoursSaved: targets.hoursSaved * progress,
        costSavings: targets.costSavings * progress,
        annualSavings: targets.annualSavings * progress,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedMetrics(targets);
      }
    }, interval);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "No data available"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { summary_metrics } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-muted rounded flex items-center justify-center text-sm font-medium">
              {selectedCompany}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <div className="w-32 h-10 bg-muted rounded flex items-center justify-center text-sm font-medium">
              Claude Code
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header with Health Score */}
        <div className="mb-8 animate-fade-in flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {selectedCompany} Claude Code ROI Report
            </h1>
            <p className="text-muted-foreground">
              Based on {summary_metrics.pre_claude.total_tasks + summary_metrics.post_claude.total_tasks} JIRA tasks analyzed
            </p>
          </div>
          <div className="flex-shrink-0">
            <HealthScore
              activeUsers={36}
              totalSeats={50}
              totalHoursSaved={21446}
              weeksOfData={5}
              engagementTrend="growth"
              trendPercentage={0.15}
            />
          </div>
        </div>

        {/* Assumptions Card */}
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>Cost Assumptions</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomEngineerCost(summary_metrics.assumptions.engineer_annual_cost);
                setIsEditingAssumptions(true);
              }}
              className="ml-4"
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit Assumptions
            </Button>
          </AlertTitle>
          <AlertDescription>
            Engineer Cost: ${summary_metrics.assumptions.engineer_annual_cost.toLocaleString()}/year |
            Hourly Rate: ${summary_metrics.assumptions.hourly_rate.toFixed(2)}/hour |
            Hours/Day: {summary_metrics.assumptions.hours_per_day}
          </AlertDescription>
        </Alert>

        {/* Edit Assumptions Modal */}
        {isEditingAssumptions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card border rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Edit Cost Assumptions</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Annual Engineer Cost ($)
                  </label>
                  <input
                    type="number"
                    value={customEngineerCost || ''}
                    onChange={(e) => setCustomEngineerCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                    placeholder="100000"
                    min="0"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingAssumptions(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAssumptions}
                    style={{ backgroundColor: '#CC785C' }}
                    className="text-white hover:opacity-90"
                  >
                    Save & Recalculate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Grid - Same across all tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Users"
            value="36"
            trend="up"
            subtitle="Total developers using Claude"
            icon={TrendingUp}
          />
          <MetricCard
            title="Lines of Code"
            value="7.1M"
            trend="up"
            subtitle="Generated since adoption"
            icon={Award}
          />
          <MetricCard
            title="Hours Saved"
            value="21,446"
            trend="up"
            subtitle="Engineering time saved"
            icon={Clock}
          />
          <MetricCard
            title="Cost Savings"
            value="$1,072K"
            trend="up"
            subtitle="Total cost savings"
            icon={DollarSign}
          />
        </div>

        {/* Metric Explanation Modal */}
        {showMetricModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMetricModal(null)}>
            <div className="bg-card border rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-semibold mb-4">
                {showMetricModal === 'timeSavings' && 'Time Savings Calculation'}
                {showMetricModal === 'hoursSaved' && 'Hours Saved Calculation'}
                {showMetricModal === 'costSavings' && 'Cost Savings Calculation'}
                {showMetricModal === 'annualProjection' && 'Annual Projection Calculation'}
              </h3>
              <div className="space-y-3 text-sm">
                {showMetricModal === 'timeSavings' && (
                  <>
                    <p className="text-muted-foreground">
                      Time savings percentage shows how much faster tasks are completed with Claude Code compared to before.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
                      Time Savings % = ((Pre-Claude Hours - Post-Claude Hours) / Pre-Claude Hours) × 100
                    </div>
                    <div className="space-y-1">
                      <p><strong>Pre-Claude Avg:</strong> {summary_metrics.pre_claude.avg_hours_per_task.toFixed(1)} hours/task</p>
                      <p><strong>Post-Claude Avg:</strong> {summary_metrics.post_claude.avg_hours_per_task.toFixed(1)} hours/task</p>
                      <p><strong>Result:</strong> {animatedMetrics.timeSavings.toFixed(1)}% time savings</p>
                    </div>
                  </>
                )}
                {showMetricModal === 'hoursSaved' && (
                  <>
                    <p className="text-muted-foreground">
                      Total engineering hours saved by using Claude Code across all post-adoption tasks.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
                      Hours Saved = (Pre-Claude Avg Hours - Post-Claude Avg Hours) × Post-Claude Task Count
                    </div>
                    <div className="space-y-1">
                      <p><strong>Hour Difference:</strong> {(summary_metrics.pre_claude.avg_hours_per_task - summary_metrics.post_claude.avg_hours_per_task).toFixed(1)} hours/task</p>
                      <p><strong>Post-Claude Tasks:</strong> {summary_metrics.post_claude.total_tasks} tasks</p>
                      <p><strong>Result:</strong> {Math.floor(animatedMetrics.hoursSaved).toLocaleString()} hours saved</p>
                    </div>
                  </>
                )}
                {showMetricModal === 'costSavings' && (
                  <>
                    <p className="text-muted-foreground">
                      Cost savings based on reduced engineering time at the configured hourly rate.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
                      Cost Savings = Hours Saved × Hourly Rate
                    </div>
                    <div className="space-y-1">
                      <p><strong>Hours Saved:</strong> {Math.floor(animatedMetrics.hoursSaved).toLocaleString()} hours</p>
                      <p><strong>Hourly Rate:</strong> ${summary_metrics.assumptions.hourly_rate.toFixed(2)}/hour</p>
                      <p><strong>Result:</strong> ${Math.floor(animatedMetrics.costSavings).toLocaleString()} saved</p>
                    </div>
                  </>
                )}
                {showMetricModal === 'annualProjection' && (
                  <>
                    <p className="text-muted-foreground">
                      Projected annual savings based on current task completion rate and cost savings per task.
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg font-mono text-xs">
                      Annual Projection = Cost Savings × 4 quarters
                    </div>
                    <div className="space-y-1">
                      <p><strong>Current Period Savings:</strong> ${Math.floor(animatedMetrics.costSavings).toLocaleString()}</p>
                      <p><strong>Annualized (×4):</strong> ${Math.floor(animatedMetrics.annualSavings).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-2">Note: Assumes consistent task volume throughout the year</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowMetricModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chart Selector Tabs */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setSelectedChart("usage")}
            className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              selectedChart === "usage"
                ? "bg-[#CC785C] text-white shadow-md"
                : "bg-card border text-muted-foreground hover:bg-[#CC785C]/10 hover:text-[#CC785C] hover:border-[#CC785C]/30"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Usage Metrics</span>
          </button>
          <button
            onClick={() => setSelectedChart("savings")}
            className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              selectedChart === "savings"
                ? "bg-[#CC785C] text-white shadow-md"
                : "bg-card border text-muted-foreground hover:bg-[#CC785C]/10 hover:text-[#CC785C] hover:border-[#CC785C]/30"
            }`}
          >
            <LineChart className="h-4 w-4" />
            <span>Summary of Value Impact</span>
          </button>
          <button
            onClick={() => setSelectedChart("productivity")}
            className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              selectedChart === "productivity"
                ? "bg-[#CC785C] text-white shadow-md"
                : "bg-card border text-muted-foreground hover:bg-[#CC785C]/10 hover:text-[#CC785C] hover:border-[#CC785C]/30"
            }`}
          >
            <BarChart className="h-4 w-4" />
            <span>Productivity Comparison</span>
          </button>
        </div>

        {/* Selected Chart */}
        <div className="mb-8">
          {selectedChart === "savings" && (
            <div className="space-y-6">
              <SavingsChart
                timeSeriesData={dashboardData.time_series_data}
                costSavingsPerTask={summary_metrics.improvements.cost_savings_per_task}
                claudeAdoptionDate={summary_metrics.claude_adoption_date}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <HoursPerTicketChart
                  timeSeriesData={dashboardData.time_series_data}
                  claudeAdoptionDate={summary_metrics.claude_adoption_date}
                />
                <TotalTicketsChart
                  timeSeriesData={dashboardData.time_series_data}
                  claudeAdoptionDate={summary_metrics.claude_adoption_date}
                />
              </div>
            </div>
          )}
          {selectedChart === "productivity" && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <ProductivityChart
                  preClaudeHours={summary_metrics.pre_claude.avg_hours_per_task}
                  postClaudeHours={summary_metrics.post_claude.avg_hours_per_task}
                />
                <TasksCompletedChart
                  preClaudeTotalTasks={summary_metrics.pre_claude.total_tasks}
                  postClaudeTotalTasks={summary_metrics.post_claude.total_tasks}
                  preClaudeDays={summary_metrics.pre_claude.total_tasks * summary_metrics.pre_claude.avg_days_per_task}
                  postClaudeDays={summary_metrics.post_claude.total_tasks * summary_metrics.post_claude.avg_days_per_task}
                />
              </div>

              {/* Detailed Metrics for Productivity Comparison */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Pre-Claude Period */}
                <div className="bg-card rounded-2xl border p-6">
                  <h3 className="text-lg font-semibold mb-4">Pre-Claude Period</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tasks</span>
                      <span className="font-semibold">{summary_metrics.pre_claude.total_tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-semibold">
                        {summary_metrics.pre_claude.completed_tasks} ({summary_metrics.pre_claude.completion_rate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Days/Task</span>
                      <span className="font-semibold">{summary_metrics.pre_claude.avg_days_per_task.toFixed(1)} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Hours/Task</span>
                      <span className="font-semibold">{summary_metrics.pre_claude.avg_hours_per_task.toFixed(1)} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Cost/Task</span>
                      <span className="font-semibold">${summary_metrics.pre_claude.avg_cost_per_task.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Post-Claude Period */}
                <div className="bg-card rounded-2xl border p-6">
                  <h3 className="text-lg font-semibold mb-4">Post-Claude Period</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tasks</span>
                      <span className="font-semibold">{summary_metrics.post_claude.total_tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-semibold">
                        {summary_metrics.post_claude.completed_tasks} ({summary_metrics.post_claude.completion_rate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Days/Task</span>
                      <span className="font-semibold text-green-600">
                        {summary_metrics.post_claude.avg_days_per_task.toFixed(1)} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Hours/Task</span>
                      <span className="font-semibold text-green-600">
                        {summary_metrics.post_claude.avg_hours_per_task.toFixed(1)} hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Cost/Task</span>
                      <span className="font-semibold text-green-600">
                        ${summary_metrics.post_claude.avg_cost_per_task.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {selectedChart === "usage" && (
            <UsageMetrics />
          )}
        </div>

        {/* Data Source Info */}
        <div className="mb-8">
          <DataSourceInfo />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
