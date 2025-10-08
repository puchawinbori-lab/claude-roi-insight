import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdoptionChartProps {
  timeSeriesData: any[];
  costSavingsPerTask: number;
}

const AdoptionChart = ({ timeSeriesData, costSavingsPerTask }: AdoptionChartProps) => {
  // Process data to show weekly tasks completed and cumulative savings
  const postClaudeData = timeSeriesData.filter(item => item.Period === 'Post-Claude');

  let cumulativeHoursSaved = 0;
  const chartData = postClaudeData.map((item, index) => {
    const hoursSavedThisWeek = item.Task_Count * item.Avg_Hours;
    cumulativeHoursSaved += hoursSavedThisWeek;

    return {
      week: `Week ${index + 1}`,
      tasksCompleted: item.Task_Count,
      cumulativeHoursSaved: Math.round(cumulativeHoursSaved)
    };
  });

  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Task Completion & Impact Over Time</h3>
        <p className="text-sm text-muted-foreground">
          Weekly tasks completed and cumulative hours saved since Claude adoption
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Tasks Completed", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Cumulative Hours Saved", angle: 90, position: "insideRight" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tasksCompleted"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))" }}
            name="Tasks Completed"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeHoursSaved"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--success))" }}
            name="Cumulative Hours Saved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdoptionChart;
