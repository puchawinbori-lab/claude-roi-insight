import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  const [showBreakdown, setShowBreakdown] = useState(false);

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
    <div className="relative">
      <div
        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${getScoreBgColor(totalScore)}`}
        onClick={() => setShowBreakdown(!showBreakdown)}
      >
        <div className="text-xs font-medium text-muted-foreground mb-1">Customer Health Score</div>
        <div className={`text-3xl font-bold ${getScoreColor(totalScore)}`}>
          {totalScore}
          <span className="text-base font-normal text-muted-foreground">/100</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{getScoreLabel(totalScore)}</div>
      </div>

      {/* Breakdown Modal */}
      {showBreakdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-xl shadow-xl z-50 p-4">
          <h4 className="font-semibold mb-3">Health Score Breakdown</h4>

          <div className="space-y-3 text-sm">
            {/* ROI Component */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">ROI Impact</span>
                <span className="font-semibold">{Math.round(roiScore)}/40</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-[#CC785C] h-2 rounded-full transition-all"
                  style={{ width: `${(roiScore / 40) * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {hoursPerSeat.toFixed(1)} hours saved per seat/week
              </div>
            </div>

            {/* Adoption Component */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Adoption Rate</span>
                <span className="font-semibold">{Math.round(adoptionScore)}/35</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-[#CC785C] h-2 rounded-full transition-all"
                  style={{ width: `${(adoptionScore / 35) * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {activeUsers} of {totalSeats} users active ({Math.round(adoptionRate * 100)}%)
              </div>
            </div>

            {/* Engagement Trend */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Engagement Trend</span>
                <span className="font-semibold flex items-center gap-1">
                  {getTrendIcon()}
                  {Math.round(trendScore)}/25
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-[#CC785C] h-2 rounded-full transition-all"
                  style={{ width: `${(trendScore / 25) * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {trendPercentage > 0 ? '+' : ''}{(trendPercentage * 100).toFixed(1)}% change in recent usage
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total Score</span>
              <span className={getScoreColor(totalScore)}>{totalScore}/100</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthScore;
