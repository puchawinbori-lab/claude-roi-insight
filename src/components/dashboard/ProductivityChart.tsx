import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Pre-Claude",
    hours: 18.5,
  },
  {
    name: "Post-Claude",
    hours: 13.2,
  },
];

const ProductivityChart = () => {
  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Productivity Comparison</h3>
        <p className="text-sm text-muted-foreground">Average hours per ticket</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{ value: "Hours", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;
