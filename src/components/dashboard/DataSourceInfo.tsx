import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DataSourceInfo = () => {
  // Get form data from session storage if available
  const formData = sessionStorage.getItem("formData");
  const data = formData ? JSON.parse(formData) : null;

  return (
    <div className="bg-card rounded-xl border shadow-sm animate-fade-in">
      <Accordion type="single" collapsible>
        <AccordionItem value="methodology" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <h3 className="text-lg font-semibold">Methodology & Data Sources</h3>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-2">Connected Data Sources:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• JIRA Instance: {data?.jiraUrl || "fintechco.atlassian.net"}</li>
                  <li>• Analysis Period: Last 6 months</li>
                  <li>• Tickets Analyzed: 343 completed tickets</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium mb-2">Calculation Methodology:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>Velocity-based ROI:</strong> Comparing pre and post-Claude ticket completion rates</li>
                  <li>• <strong>Time Savings:</strong> Average hours per ticket × number of tickets completed</li>
                  <li>• <strong>Cost Calculation:</strong> Time saved × average developer hourly rate ($75/hr)</li>
                  <li>• <strong>Net Value:</strong> Total savings minus Claude Code subscription costs</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-2">Key Assumptions:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Average developer hourly rate: $75</li>
                  <li>• Claude Code cost: $20/user/month</li>
                  <li>• Team size: 25 developers</li>
                  <li>• Analysis excludes outliers (tickets &gt;40 hours or &lt;1 hour)</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default DataSourceInfo;
