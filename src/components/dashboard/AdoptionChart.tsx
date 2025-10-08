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

const data = [
  { day: "Day 0", adoption: 0, hours: 0 },
  { day: "Day 15", adoption: 25, hours: 156 },
  { day: "Day 30", adoption: 48, hours: 389 },
  { day: "Day 45", adoption: 67, hours: 642 },
  { day: "Day 60", adoption: 82, hours: 891 },
  { day: "Day 75", adoption: 91, hours: 1089 },
  { day: "Day 90", adoption: 96, hours: 1248 },
];

const AdoptionChart = () => {
  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Claude Code Adoption & Impact</h3>
        <p className="text-sm text-muted-foreground">
          Adoption percentage and cumulative hours saved over 90 days
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Adoption %", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Hours Saved", angle: 90, position: "insideRight" }}
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
            dataKey="adoption"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))" }}
            name="Adoption %"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="hours"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--success))" }}
            name="Hours Saved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdoptionChart;
