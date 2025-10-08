import { CheckCircle2, DollarSign } from "lucide-react";

interface InsightCardProps {
  type: "success" | "info";
  title: string;
  insights: string[];
}

const InsightCard = ({ type, title, insights }: InsightCardProps) => {
  const Icon = type === "success" ? CheckCircle2 : DollarSign;
  const colorClass = type === "success" ? "success" : "info";

  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm hover-lift animate-fade-in">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg bg-${colorClass}/10 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 text-${colorClass}`} />
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
