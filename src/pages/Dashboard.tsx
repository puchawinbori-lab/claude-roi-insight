import { useEffect, useState } from "react";
import { Download, TrendingUp, DollarSign, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import MetricCard from "@/components/dashboard/MetricCard";
import ProductivityChart from "@/components/dashboard/ProductivityChart";
import SavingsChart from "@/components/dashboard/SavingsChart";
import InsightCard from "@/components/dashboard/InsightCard";
import AdoptionChart from "@/components/dashboard/AdoptionChart";
import DataSourceInfo from "@/components/dashboard/DataSourceInfo";

const Dashboard = () => {
  const [animatedMetrics, setAnimatedMetrics] = useState({
    roi: 0,
    hoursSaved: 0,
    costSavings: 0,
    netValue: 0,
  });

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const targets = {
      roi: 247,
      hoursSaved: 1248,
      costSavings: 93600,
      netValue: 87400,
    };

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedMetrics({
        roi: Math.floor(targets.roi * progress),
        hoursSaved: Math.floor(targets.hoursSaved * progress),
        costSavings: Math.floor(targets.costSavings * progress),
        netValue: Math.floor(targets.netValue * progress),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedMetrics(targets);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

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
            Based on your JIRA data and productivity metrics
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="ROI Percentage"
            value={`${animatedMetrics.roi}%`}
            trend="up"
            subtitle="Return on Investment"
            icon={TrendingUp}
          />
          <MetricCard
            title="Hours Saved"
            value={animatedMetrics.hoursSaved.toLocaleString()}
            trend="up"
            subtitle="Total hours saved"
            icon={Clock}
          />
          <MetricCard
            title="Cost Savings"
            value={`$${animatedMetrics.costSavings.toLocaleString()}`}
            trend="up"
            subtitle="In developer productivity"
            icon={DollarSign}
          />
          <MetricCard
            title="Net Value"
            value={`$${animatedMetrics.netValue.toLocaleString()}`}
            trend="up"
            subtitle="After Claude costs"
            icon={Award}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <ProductivityChart />
          <SavingsChart />
        </div>

        {/* Insights Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <InsightCard
            type="success"
            title="Productivity Gains"
            insights={[
              "36% increase in ticket throughput",
              "29% reduction in time per ticket",
              "Payback period: 0.8 months",
            ]}
          />
          <InsightCard
            type="info"
            title="Financial Impact"
            insights={[
              "Total investment: $6,000",
              "Total savings: $93,600",
              "Break-even: Month 0.8",
            ]}
          />
        </div>

        {/* Adoption Trend */}
        <div className="mb-8">
          <AdoptionChart />
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
      </div>
    </div>
  );
};

export default Dashboard;
