import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface TotalTicketsChartProps {
  timeSeriesData: any[];
  claudeAdoptionDate: string;
}

const TotalTicketsChart = ({ timeSeriesData, claudeAdoptionDate }: TotalTicketsChartProps) => {
  // Create data for all weeks from the dataset
  const chartData = timeSeriesData
    .filter(item => item.Week_Start && item.Task_Count != null) // Filter out invalid data
    .map((item) => {
      // Calculate the date for each week
      const weekDate = new Date(item.Week_Start);

      // Check if date is valid
      if (isNaN(weekDate.getTime())) {
        console.warn('Invalid date:', item.Week_Start);
        return null;
      }

      const formattedDate = `${String(weekDate.getMonth() + 1).padStart(2, '0')}/${String(weekDate.getDate()).padStart(2, '0')}`;

      return {
        week: formattedDate,
        ticketsClosed: item.Task_Count,
        isAdoptionWeek: item.Week_Start === claudeAdoptionDate,
        weekStart: item.Week_Start
      };
    })
    .filter(item => item !== null); // Remove any null entries

  // Find the adoption week index
  const adoptionWeekIndex = chartData.findIndex(d => d.isAdoptionWeek);

  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Total Tickets Closed per Week</h3>
        <p className="text-sm text-muted-foreground">Weekly ticket completion with Claude Code adoption marker</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="week"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Tickets Closed", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => [value, "Tickets Closed"]}
          />
          {/* Vertical line at Claude adoption */}
          {adoptionWeekIndex >= 0 && (
            <ReferenceLine
              x={chartData[adoptionWeekIndex].week}
              stroke="#CC785C"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: "Claude Adopted (08/24)",
                position: "top",
                fill: "#CC785C",
                fontSize: 11,
                fontWeight: 600
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="ticketsClosed"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalTicketsChart;
