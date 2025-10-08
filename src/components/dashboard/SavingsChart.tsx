import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SavingsChartProps {
  timeSeriesData: any[];
  costSavingsPerTask: number;
  claudeAdoptionDate: string;
}

const SavingsChart = ({ timeSeriesData, costSavingsPerTask, claudeAdoptionDate }: SavingsChartProps) => {
  // Calculate cumulative savings week by week for Post-Claude period only
  const postClaudeData = timeSeriesData.filter(item => item.Period === 'Post-Claude');

  // Parse the Claude adoption date
  const adoptionDate = new Date(claudeAdoptionDate);

  let cumulativeSavings = 0;
  const cumulativeData = postClaudeData
    .slice(0, 5) // Truncate at Week 5
    .map((item, index) => {
      const weeklySavings = item.Task_Count * costSavingsPerTask;
      cumulativeSavings += weeklySavings;

      // Calculate the date for this week (adoption date + index weeks)
      const weekDate = new Date(adoptionDate);
      weekDate.setDate(weekDate.getDate() + (index * 7));
      const formattedDate = `${String(weekDate.getMonth() + 1).padStart(2, '0')}/${String(weekDate.getDate()).padStart(2, '0')}`;

      return {
        week: `Week ${index + 1} - ${formattedDate}`,
        savings: Math.round(cumulativeSavings),
        taskCount: item.Task_Count
      };
    });

  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Cumulative Savings Over Time</h3>
        <p className="text-sm text-muted-foreground">Total cost savings since Claude adoption</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={cumulativeData}>
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Savings"]}
          />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#savingsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SavingsChart;
