import { useEffect, useState } from "react";
import { Download, TrendingUp, DollarSign, Clock, Award, AlertCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MetricCard from "@/components/dashboard/MetricCard";
import ProductivityChart from "@/components/dashboard/ProductivityChart";
import SavingsChart from "@/components/dashboard/SavingsChart";
import InsightCard from "@/components/dashboard/InsightCard";
import AdoptionChart from "@/components/dashboard/AdoptionChart";
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newEngineerCost, setNewEngineerCost] = useState("");

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

  const recalculateWithNewCost = () => {
    if (!dashboardData || !newEngineerCost) return;

    const newCost = parseFloat(newEngineerCost);
    if (isNaN(newCost) || newCost <= 0) {
      alert("Please enter a valid engineer cost");
      return;
    }

    // Recalculate based on new engineer cost
    const HOURS_PER_DAY = 8;
    const WORKING_DAYS_PER_YEAR = 250;
    const newHourlyRate = newCost / (HOURS_PER_DAY * WORKING_DAYS_PER_YEAR);

    // Create updated data with new cost assumptions
    const updatedData = { ...dashboardData };
    updatedData.summary_metrics = {
      ...dashboardData.summary_metrics,
      assumptions: {
        engineer_annual_cost: newCost,
        hours_per_day: HOURS_PER_DAY,
        hourly_rate: newHourlyRate,
      },
      pre_claude: {
        ...dashboardData.summary_metrics.pre_claude,
        avg_cost_per_task: dashboardData.summary_metrics.pre_claude.avg_hours_per_task * newHourlyRate,
        total_cost: dashboardData.summary_metrics.pre_claude.total_tasks * dashboardData.summary_metrics.pre_claude.avg_hours_per_task * newHourlyRate,
      },
      post_claude: {
        ...dashboardData.summary_metrics.post_claude,
        avg_cost_per_task: dashboardData.summary_metrics.post_claude.avg_hours_per_task * newHourlyRate,
        total_cost: dashboardData.summary_metrics.post_claude.total_tasks * dashboardData.summary_metrics.post_claude.avg_hours_per_task * newHourlyRate,
      },
      improvements: {
        ...dashboardData.summary_metrics.improvements,
        cost_savings_per_task: (dashboardData.summary_metrics.pre_claude.avg_hours_per_task - dashboardData.summary_metrics.post_claude.avg_hours_per_task) * newHourlyRate,
        cost_savings_percent: dashboardData.summary_metrics.improvements.time_savings_percent, // Same as time savings
        annual_savings_estimate: (dashboardData.summary_metrics.pre_claude.avg_hours_per_task - dashboardData.summary_metrics.post_claude.avg_hours_per_task) * newHourlyRate * (dashboardData.summary_metrics.post_claude.total_tasks / ((new Date(dashboardData.summary_metrics.post_claude.total_tasks).getTime() - new Date(dashboardData.summary_metrics.claude_adoption_date).getTime()) / (1000 * 60 * 60 * 24)) || 1) * 365,
      }
    };

    // Update state
    setDashboardData(updatedData);
    animateMetrics(updatedData.summary_metrics);
    setIsEditModalOpen(false);
    setNewEngineerCost("");
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
          <AlertDescription className="flex items-center justify-between">
            <span>
              Engineer Cost: ${summary_metrics.assumptions.engineer_annual_cost.toLocaleString()}/year |
              Hourly Rate: ${summary_metrics.assumptions.hourly_rate.toFixed(2)}/hour |
              Hours/Day: {summary_metrics.assumptions.hours_per_day}
            </span>
            <Button
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="ml-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <Edit className="w-3 h-3 mr-2" />
              Edit Assumptions
            </Button>
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
            calculation={{
              formula: "((Pre-Claude Hours - Post-Claude Hours) / Pre-Claude Hours) × 100",
              explanation: [
                `Pre-Claude average: ${summary_metrics.pre_claude.avg_hours_per_task.toFixed(1)} hours per task`,
                `Post-Claude average: ${summary_metrics.post_claude.avg_hours_per_task.toFixed(1)} hours per task`,
                `Difference: ${(summary_metrics.pre_claude.avg_hours_per_task - summary_metrics.post_claude.avg_hours_per_task).toFixed(1)} hours`,
                `Percentage saved: ${summary_metrics.improvements.time_savings_percent.toFixed(1)}%`
              ]
            }}
          />
          <MetricCard
            title="Hours Saved"
            value={Math.floor(animatedMetrics.hoursSaved).toLocaleString()}
            trend="up"
            subtitle={`Post-Claude: ${summary_metrics.post_claude.avg_hours_per_task.toFixed(1)}h avg`}
            icon={Clock}
            calculation={{
              formula: "(Pre-Claude Avg - Post-Claude Avg) × Total Post-Claude Tasks",
              explanation: [
                `Hours saved per task: ${(summary_metrics.pre_claude.avg_hours_per_task - summary_metrics.post_claude.avg_hours_per_task).toFixed(1)} hours`,
                `Total Post-Claude tasks: ${summary_metrics.post_claude.total_tasks}`,
                `Total hours saved: ${Math.floor((summary_metrics.pre_claude.avg_hours_per_task - summary_metrics.post_claude.avg_hours_per_task) * summary_metrics.post_claude.total_tasks)} hours`,
                `Assuming ${summary_metrics.assumptions.hours_per_day} hour work days`
              ]
            }}
          />
          <MetricCard
            title="Cost Savings"
            value={`$${Math.floor(animatedMetrics.costSavings).toLocaleString()}`}
            trend="up"
            subtitle="In developer productivity"
            icon={DollarSign}
            calculation={{
              formula: "Cost Savings Per Task × Total Post-Claude Tasks",
              explanation: [
                `Hourly rate: $${summary_metrics.assumptions.hourly_rate.toFixed(2)}/hour`,
                `Cost savings per task: $${summary_metrics.improvements.cost_savings_per_task.toFixed(2)}`,
                `Total Post-Claude tasks: ${summary_metrics.post_claude.total_tasks}`,
                `Total cost savings: $${Math.floor(summary_metrics.improvements.cost_savings_per_task * summary_metrics.post_claude.total_tasks).toLocaleString()}`,
                `Based on ${summary_metrics.improvements.cost_savings_percent.toFixed(1)}% cost reduction`
              ]
            }}
          />
          <MetricCard
            title="Annual Projection"
            value={`$${Math.floor(animatedMetrics.annualSavings).toLocaleString()}`}
            trend="up"
            subtitle="Estimated yearly savings"
            icon={Award}
            calculation={{
              formula: "Tasks Per Day × 365 Days × Cost Savings Per Task",
              explanation: [
                `Cost savings per task: $${summary_metrics.improvements.cost_savings_per_task.toFixed(2)}`,
                `Based on current completion velocity`,
                `Projected over 365 days`,
                `Annual savings estimate: $${summary_metrics.improvements.annual_savings_estimate.toLocaleString()}`,
                `Assumes consistent task volume and productivity gains`
              ]
            }}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ProductivityChart
            preClaudeHours={summary_metrics.pre_claude.avg_hours_per_task}
            postClaudeHours={summary_metrics.post_claude.avg_hours_per_task}
          />
          <SavingsChart
            timeSeriesData={dashboardData.time_series_data}
            costSavingsPerTask={summary_metrics.improvements.cost_savings_per_task}
            claudeAdoptionDate={summary_metrics.claude_adoption_date}
          />
        </div>

        {/* Detailed Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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

        {/* Insights Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <InsightCard
            type="success"
            title="Productivity Gains"
            insights={[
              `${summary_metrics.improvements.speed_improvement_percent.toFixed(1)}% faster task completion`,
              `${summary_metrics.improvements.completion_rate_improvement.toFixed(1)}% improvement in completion rate`,
              `${summary_metrics.improvements.time_savings_percent.toFixed(1)}% reduction in time per task`,
            ]}
          />
          <InsightCard
            type="info"
            title="Financial Impact"
            insights={[
              `$${summary_metrics.improvements.cost_savings_per_task.toFixed(2)} saved per task`,
              `${summary_metrics.improvements.cost_savings_percent.toFixed(1)}% cost reduction`,
              `Annual savings: $${summary_metrics.improvements.annual_savings_estimate.toLocaleString()}`,
            ]}
          />
        </div>

        {/* Adoption Trend */}
        <div className="mb-8">
          <AdoptionChart
            timeSeriesData={dashboardData.time_series_data}
            costSavingsPerTask={summary_metrics.improvements.cost_savings_per_task}
          />
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
            <Button size="lg" className="gradient-copper hover:opacity-90">
              Contact Sales
            </Button>
          </div>
        </div>

        {/* Edit Assumptions Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Cost Assumptions</DialogTitle>
              <DialogDescription>
                Update the engineer annual cost to recalculate all metrics
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="engineer-cost" className="text-right">
                  Engineer Cost
                </Label>
                <Input
                  id="engineer-cost"
                  type="number"
                  placeholder={summary_metrics.assumptions.engineer_annual_cost.toString()}
                  value={newEngineerCost}
                  onChange={(e) => setNewEngineerCost(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="text-xs text-muted-foreground ml-auto">
                Current: ${summary_metrics.assumptions.engineer_annual_cost.toLocaleString()}/year
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setNewEngineerCost("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={recalculateWithNewCost}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Recalculate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
