import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HealthScoreProps {
  activeUsers: number;
  totalSeats: number;
  totalHoursSaved: number;
  weeksOfData: number;
  engagementTrend: "growth" | "stable" | "decline";
  trendPercentage: number;
}

const HealthScore = ({
  activeUsers,
  totalSeats,
  totalHoursSaved,
  weeksOfData,
  engagementTrend,
  trendPercentage
}: HealthScoreProps) => {
  const [showMethodology, setShowMethodology] = useState(false);

  // ========================================
  // 1. ROI Component (40 points max)
  // ========================================
  const hoursSavedWeekly = totalHoursSaved / weeksOfData;
  const hoursPerSeat = hoursSavedWeekly / totalSeats;

  // Benchmark: 10 hours/seat/week = maximum ROI score (40 points)
  const ROI_BENCHMARK = 10;
  const roiScore = Math.min(40, (hoursPerSeat / ROI_BENCHMARK) * 40);

  // ========================================
  // 2. Adoption Component (35 points max)
  // ========================================
  const adoptionRate = activeUsers / totalSeats;
  const adoptionScore = adoptionRate * 35;

  // ========================================
  // 3. Engagement Trend (25 points max)
  // ========================================
  let trendScore;

  if (trendPercentage > 0.20) {
    trendScore = 25;  // Strong growth (>20%)
  } else if (trendPercentage > 0.05) {
    trendScore = 20;  // Moderate growth (5-20%)
  } else if (trendPercentage >= -0.05) {
    trendScore = 15;  // Stable (±5%)
  } else if (trendPercentage >= -0.20) {
    trendScore = 8;   // Slight decline (5-20%)
  } else {
    trendScore = 3;   // Significant decline (>20%)
  }

  // ========================================
  // Final Score
  // ========================================
  const totalScore = Math.round(roiScore + adoptionScore + trendScore);

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  const getTrendIcon = () => {
    if (engagementTrend === "growth") return <TrendingUp className="h-4 w-4" />;
    if (engagementTrend === "decline") return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <>
      <div className="relative">
        <div
          className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${getScoreBgColor(totalScore)}`}
          onClick={() => setShowMethodology(true)}
        >
          <div className="text-xs font-medium text-muted-foreground mb-1">Customer Health Score</div>
          <div className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
            {totalScore}
            <span className="text-base font-normal text-muted-foreground">/100</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{getScoreLabel(totalScore)} - Click for details</div>
        </div>
      </div>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMethodology(false)}>
          <div className="bg-card border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Customer Health Score Methodology</h3>
              <button onClick={() => setShowMethodology(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview */}
              <div>
                <h4 className="font-semibold text-lg mb-2">Overview</h4>
                <p className="text-sm text-muted-foreground">
                  The Customer Health Score is a composite metric (0-100) that evaluates the success and sustainability
                  of Claude Code adoption within an organization. It combines three key dimensions: ROI Impact,
                  Adoption Rate, and Engagement Trend.
                </p>
              </div>

              {/* Scoring Components */}
              <div>
                <h4 className="font-semibold text-lg mb-3">Scoring Components</h4>

                {/* 1. ROI Impact */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">1. ROI Impact (40 points max)</h5>
                    <span className="text-sm font-mono text-[#CC785C]">{Math.round(roiScore)}/40</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Measures the actual productivity value delivered per user. Based on hours saved per seat per week.
                  </p>
                  <div className="bg-card p-3 rounded border space-y-2 text-sm font-mono">
                    <div>Formula: <code className="text-[#CC785C]">min(40, (hours_per_seat_week / 10) × 40)</code></div>
                    <div className="text-xs text-muted-foreground">Benchmark: 10 hours/seat/week = maximum score (40 pts)</div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total hours saved:</span>
                      <span className="font-semibold">{totalHoursSaved.toLocaleString()} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weeks of data:</span>
                      <span className="font-semibold">{weeksOfData} weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hours saved per week:</span>
                      <span className="font-semibold">{hoursSavedWeekly.toFixed(1)} hours/week</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total seats:</span>
                      <span className="font-semibold">{totalSeats} seats</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="text-muted-foreground">Hours per seat per week:</span>
                      <span className="font-semibold text-[#CC785C]">{hoursPerSeat.toFixed(2)} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score calculation:</span>
                      <span className="font-semibold text-[#CC785C]">({hoursPerSeat.toFixed(2)} / 10) × 40 = {roiScore.toFixed(1)} pts</span>
                    </div>
                  </div>
                </div>

                {/* 2. Adoption Rate */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">2. Adoption Rate (35 points max)</h5>
                    <span className="text-sm font-mono text-[#CC785C]">{Math.round(adoptionScore)}/35</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Measures what percentage of available users are actively using Claude Code.
                  </p>
                  <div className="bg-card p-3 rounded border space-y-2 text-sm font-mono">
                    <div>Formula: <code className="text-[#CC785C]">(active_users / total_seats) × 35</code></div>
                    <div className="text-xs text-muted-foreground">100% adoption = maximum score (35 pts)</div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active users:</span>
                      <span className="font-semibold">{activeUsers} users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total seats:</span>
                      <span className="font-semibold">{totalSeats} seats</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="text-muted-foreground">Adoption rate:</span>
                      <span className="font-semibold text-[#CC785C]">{(adoptionRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score calculation:</span>
                      <span className="font-semibold text-[#CC785C]">({activeUsers} / {totalSeats}) × 35 = {adoptionScore.toFixed(1)} pts</span>
                    </div>
                  </div>
                </div>

                {/* 3. Engagement Trend */}
                <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">3. Engagement Trend (25 points max)</h5>
                    <span className="text-sm font-mono text-[#CC785C] flex items-center gap-1">
                      {getTrendIcon()}
                      {Math.round(trendScore)}/25
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Evaluates whether usage is growing, stable, or declining over recent weeks.
                  </p>
                  <div className="bg-card p-3 rounded border space-y-2 text-sm">
                    <div className="font-semibold mb-1">Scoring Tiers:</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Strong growth (&gt;20%):</span>
                        <span className="font-mono">25 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Moderate growth (5-20%):</span>
                        <span className="font-mono">20 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stable (±5%):</span>
                        <span className="font-mono">15 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Slight decline (5-20%):</span>
                        <span className="font-mono">8 points</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Significant decline (&gt;20%):</span>
                        <span className="font-mono">3 points</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recent trend:</span>
                      <span className="font-semibold">{engagementTrend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Percentage change:</span>
                      <span className="font-semibold text-[#CC785C]">{trendPercentage > 0 ? '+' : ''}{(trendPercentage * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="text-muted-foreground">Tier assigned:</span>
                      <span className="font-semibold text-[#CC785C]">{trendScore} points</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Score */}
              <div className="p-4 bg-muted/50 rounded-lg border-2 border-[#CC785C]">
                <h4 className="font-semibold text-lg mb-3">Final Score Calculation</h4>
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span>ROI Impact:</span>
                    <span className="font-mono">{roiScore.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adoption Rate:</span>
                    <span className="font-mono">{adoptionScore.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement Trend:</span>
                    <span className="font-mono">{trendScore.toFixed(1)} pts</span>
                  </div>
                  <div className="flex justify-between border-t-2 pt-2 text-lg font-bold">
                    <span>Total Health Score:</span>
                    <span className={`${getScoreColor(totalScore)}`}>{totalScore}/100</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong>Rating:</strong> {getScoreLabel(totalScore)}
                  {totalScore >= 80 && " - Exceptional adoption with strong ROI"}
                  {totalScore >= 60 && totalScore < 80 && " - Solid adoption with room for growth"}
                  {totalScore >= 40 && totalScore < 60 && " - Moderate adoption, intervention recommended"}
                  {totalScore < 40 && " - Low adoption, immediate action required"}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowMethodology(false)} style={{ backgroundColor: '#CC785C' }} className="text-white">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HealthScore;
