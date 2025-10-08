import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TasksCompletedChartProps {
  preClaudeTotalTasks: number;
  postClaudeTotalTasks: number;
  preClaudeDays: number;
  postClaudeDays: number;
}

const TasksCompletedChart = ({
  preClaudeTotalTasks,
  postClaudeTotalTasks,
  preClaudeDays,
  postClaudeDays
}: TasksCompletedChartProps) => {
  // Calculate tasks per week
  const preClaudeTasksPerWeek = (preClaudeTotalTasks / preClaudeDays) * 7;
  const postClaudeTasksPerWeek = (postClaudeTotalTasks / postClaudeDays) * 7;

  const data = [
    {
      name: "Pre-Claude",
      tasks: preClaudeTasksPerWeek,
    },
    {
      name: "Post-Claude",
      tasks: postClaudeTasksPerWeek,
    },
  ];

  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Average Tasks Completed per Week</h3>
        <p className="text-sm text-muted-foreground">Pre vs Post Claude adoption</p>
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
            label={{ value: "Tasks/Week", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => value.toFixed(1)}
          />
          <Bar dataKey="tasks" fill="#CC785C" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TasksCompletedChart;
