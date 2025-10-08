import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Month 1", savings: 12400 },
  { month: "Month 2", savings: 28900 },
  { month: "Month 3", savings: 47200 },
  { month: "Month 4", savings: 64800 },
  { month: "Month 5", savings: 79300 },
  { month: "Month 6", savings: 93600 },
];

const SavingsChart = () => {
  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Cumulative Savings Over Time</h3>
        <p className="text-sm text-muted-foreground">Total cost savings in USD</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
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
