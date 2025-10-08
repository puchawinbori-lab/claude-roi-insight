import { useEffect, useState } from "react";
import { Download, TrendingUp, DollarSign, Clock, Award, AlertCircle, LineChart, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MetricCard from "@/components/dashboard/MetricCard";
import ProductivityChart from "@/components/dashboard/ProductivityChart";
import SavingsChart from "@/components/dashboard/SavingsChart";
import TasksCompletedChart from "@/components/dashboard/TasksCompletedChart";
import HoursPerTicketChart from "@/components/dashboard/HoursPerTicketChart";
import TotalHoursChart from "@/components/dashboard/TotalHoursChart";
import TotalTicketsChart from "@/components/dashboard/TotalTicketsChart";
import DataSourceInfo from "@/components/dashboard/DataSourceInfo";

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

  const [animatedMetrics, setAnimatedMetrics] = useState({
    timeSavings: 0,
    hoursSaved: 0,
    costSavings: 0,
    annualSavings: 0,
  });

  const [selectedChart, setSelectedChart] = useState<"savings" | "productivity" | "adoption">("savings");

  useEffect(() => {
    // Try to load data from sessionStorage
    const storedData = sessionStorage.getItem("dashboardData");

    if (storedData) {
      try {
        const data: DashboardData = JSON.parse(storedData);
        setDashboardData(data);
        setLoading(false);

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

  const animateMetrics = (metrics: SummaryMetrics) => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      timeSavings: metrics.improvements.time_savings_percent,
      hoursSaved: (metrics.pre_claude.avg_hours_per_task - metrics.post_claude.avg_hours_per_task) * metrics.post_claude.total_tasks,
      costSavings: metrics.improvements.cost_savings_per_task * metrics.post_claude.total_tasks,
      annualSavings: metrics.improvements.annual_savings_estimate,
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
              FinTechCo
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
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Your Claude Code ROI Report
          </h1>
          <p className="text-muted-foreground">
            Based on {summary_metrics.pre_claude.total_tasks + summary_metrics.post_claude.total_tasks} JIRA tasks analyzed
          </p>
        </div>

        {/* Assumptions Card */}
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cost Assumptions</AlertTitle>
          <AlertDescription>
            Engineer Cost: ${summary_metrics.assumptions.engineer_annual_cost.toLocaleString()}/year |
            Hourly Rate: ${summary_metrics.assumptions.hourly_rate.toFixed(2)}/hour |
            Hours/Day: {summary_metrics.assumptions.hours_per_day}
          </AlertDescription>
        </Alert>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Time Savings"
            value={`${animatedMetrics.timeSavings.toFixed(1)}%`}
            trend="up"
            subtitle="Faster task completion"
            icon={TrendingUp}
          />
          <MetricCard
            title="Hours Saved"
            value={Math.floor(animatedMetrics.hoursSaved).toLocaleString()}
            trend="up"
            subtitle={`Post-Claude: ${summary_metrics.post_claude.avg_hours_per_task.toFixed(1)}h avg`}
            icon={Clock}
          />
          <MetricCard
            title="Cost Savings"
            value={`$${Math.floor(animatedMetrics.costSavings).toLocaleString()}`}
            trend="up"
            subtitle="In developer productivity"
            icon={DollarSign}
          />
          <MetricCard
            title="Annual Projection"
            value={`$${Math.floor(animatedMetrics.annualSavings).toLocaleString()}`}
            trend="up"
            subtitle="Estimated yearly savings"
            icon={Award}
          />
        </div>

        {/* Chart Selector Tabs */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-center">
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
              <div className="grid md:grid-cols-2 gap-6">
                <SavingsChart
                  timeSeriesData={dashboardData.time_series_data}
                  costSavingsPerTask={summary_metrics.improvements.cost_savings_per_task}
                  claudeAdoptionDate={summary_metrics.claude_adoption_date}
                />
                <HoursPerTicketChart
                  timeSeriesData={dashboardData.time_series_data}
                  claudeAdoptionDate={summary_metrics.claude_adoption_date}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <TotalHoursChart
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
          )}
        </div>

        {/* Data Source Info */}
        <div className="mb-8">
          <DataSourceInfo />
        </div>

        {/* Footer CTA */}
        <div className="bg-card rounded-2xl border p-8 text-center space-y-4">
          <h2 className="text-2xl font-semibold">
            Ready to expand Claude Code usage?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Based on these results, scaling Claude Code across your organization
            could deliver even greater productivity gains and cost savings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="outline">
              Download Full Report
            </Button>
            <Button size="lg" style={{ backgroundColor: '#CC785C' }} className="text-white hover:opacity-90">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
