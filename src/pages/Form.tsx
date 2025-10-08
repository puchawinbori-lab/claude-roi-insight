import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  jiraUrl: z.string().url({ message: "Please enter a valid JIRA URL" }),
  apiKey: z.string().min(10, { message: "API key must be at least 10 characters" }),
  projectName: z.string().min(1, { message: "Project name is required" }),
  launchDate: z.date({ required_error: "Please select when you started using Claude Code" }),
});

const DataForm = () => {
  const navigate = useNavigate();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      jiraUrl: "",
      apiKey: "",
      projectName: "",
      launchDate: new Date(2025, 7, 25), // August 25th, 2025 (month is 0-indexed)
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      // Format the date for the API (YYYY-MM-DD)
      const claudeAdoptionDate = format(values.launchDate, "yyyy-MM-dd");

      // Store form data in session storage for dashboard refresh
      sessionStorage.setItem("formData", JSON.stringify({
        ...values,
        claudeAdoptionDate
      }));

      // Navigate to loading screen first
      navigate("/loading");

      // Call backend API to fetch JIRA data
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const apiEndpoint = `${API_URL}/api/fetch-jira`;

      console.log('\n' + '='.repeat(70));
      console.log('🔍 [FORM] FORM SUBMISSION STARTED');
      console.log('='.repeat(70));
      console.log('📍 Current location:', window.location.href);
      console.log('🌍 Environment mode:', import.meta.env.MODE);
      console.log('🔧 VITE_API_URL env var:', import.meta.env.VITE_API_URL);
      console.log('🎯 Resolved API_URL:', API_URL);
      console.log('🚀 Full endpoint:', apiEndpoint);
      console.log('='.repeat(70));

      // CRITICAL CHECK: Is API URL pointing to localhost in production?
      if (window.location.hostname !== 'localhost' && apiEndpoint.includes('localhost')) {
        const errorMsg = `
⚠️  CONFIGURATION ERROR DETECTED ⚠️

You are running in PRODUCTION (${window.location.hostname})
But trying to connect to LOCALHOST backend!

Frontend URL: ${window.location.href}
Backend URL:  ${apiEndpoint}

This will ALWAYS fail because localhost in the browser refers to the user's computer, not your server.

FIX: Set the VITE_API_URL environment variable in your deployment:
- For Vercel: Project Settings → Environment Variables → Add VITE_API_URL
- For Netlify: Site Settings → Build & deploy → Environment → Add VITE_API_URL
- Value should be your backend URL (e.g., https://your-backend.com)

Then rebuild/redeploy your frontend.
        `;
        console.error(errorMsg);
        alert(errorMsg);
        throw new Error('Cannot connect to localhost from production. See console for details.');
      }

      console.log('✅ [FORM] API URL validation passed');
      console.log('🔄 [FORM] Starting fetch request...');

      let response;
      try {
        console.log('📤 [FORM] Sending POST request to:', apiEndpoint);
        console.log('📦 [FORM] Request payload:', {
          jira_url: values.jiraUrl,
          email: values.email,
          api_token: '***' + values.apiKey.slice(-8),
          project_name: values.projectName,
          claude_adoption_date: claudeAdoptionDate
        });

        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jira_url: values.jiraUrl,
            email: values.email,
            api_token: values.apiKey,
            project_name: values.projectName,
            claude_adoption_date: claudeAdoptionDate
          }),
        });

        console.log('✅ [FORM] Fetch completed successfully');
        console.log('📥 [FORM] Response status:', response.status, response.statusText);
        console.log('📥 [FORM] Response ok:', response.ok);
        console.log('📥 [FORM] Response headers:', Object.fromEntries(response.headers.entries()));

      } catch (fetchError) {
        console.error('\n' + '❌'.repeat(35));
        console.error('❌ [FORM] FETCH FAILED - Network Error');
        console.error('❌'.repeat(35));
        console.error('Error object:', fetchError);
        console.error('Error name:', fetchError instanceof Error ? fetchError.name : 'Unknown');
        console.error('Error message:', fetchError instanceof Error ? fetchError.message : String(fetchError));
        console.error('Error type:', fetchError instanceof TypeError ? 'TypeError (NETWORK/CORS ISSUE)' : typeof fetchError);

        // Provide specific guidance based on error
        let errorGuidance = '\n🔍 TROUBLESHOOTING:\n';

        if (fetchError instanceof TypeError) {
          errorGuidance += `
This is a TypeError, which typically means:

1. NETWORK ERROR - Cannot reach the backend server
   ✓ Is your backend running? Check: ${API_URL}/api/health
   ✓ Is there a firewall blocking the connection?

2. CORS ERROR - Backend is blocking your frontend's requests
   ✓ Check backend CORS configuration
   ✓ Backend must allow origin: ${window.location.origin}

3. WRONG URL - The backend URL is incorrect
   ✓ Backend URL: ${apiEndpoint}
   ✓ Try accessing it directly in your browser

To test: Open a new tab and go to ${API_URL}/api/health
- If it loads: CORS issue (backend needs to allow ${window.location.origin})
- If it doesn't load: Backend is not accessible from this location
          `;
        }

        console.error(errorGuidance);

        throw new Error(`Failed to connect to backend at ${apiEndpoint}

${fetchError instanceof Error ? fetchError.message : 'Unknown error'}

Possible causes:
- Backend server is not running
- CORS is blocking the request
- Incorrect backend URL
- Network/firewall issue

Check browser console for detailed troubleshooting steps.`);
      }

      let data;
      try {
        const responseText = await response.text();
        console.log('🔍 [FORM] Raw response text:', responseText.substring(0, 500));
        data = JSON.parse(responseText);
        console.log('🔍 [FORM] Parsed response data:', data);
      } catch (parseError) {
        console.error('❌ [FORM] Failed to parse JSON response:', parseError);
        throw new Error('Server returned invalid JSON. Check backend logs.');
      }

      if (!response.ok) {
        console.error('❌ [FORM] Server error:', data.error || 'Unknown error');
        throw new Error(data.error || `Server error: ${response.status} ${response.statusText}`);
      }

      console.log('✅ [FORM] JIRA data fetched successfully');
      console.log('✅ [FORM] Data summary:', {
        success: data.success,
        tasksAnalyzed: data.summary_metrics?.pre_claude?.total_tasks + data.summary_metrics?.post_claude?.total_tasks
      });

      // Store the analysis results
      sessionStorage.setItem("dashboardData", JSON.stringify(data));

      // Navigate to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error('\n' + '🚨'.repeat(35));
      console.error("🚨 [FORM] FORM SUBMISSION FAILED");
      console.error('🚨'.repeat(35));
      console.error("Error object:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      console.error('🚨'.repeat(35) + '\n');

      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';

      // Show user-friendly error with action items
      const userMessage = `
❌ Form Submission Failed

${errorMessage}

📋 NEXT STEPS:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for the detailed error logs above
4. Screenshot the console output
5. Check PRODUCTION_TROUBLESHOOTING.md in the repo

Common fixes:
• Check if backend is running
• Verify VITE_API_URL is set correctly
• Ensure CORS is configured on backend
      `.trim();

      alert(userMessage);

      setIsSubmitting(false);
      // Clear any stored form data to prevent error messages from persisting
      sessionStorage.removeItem("formData");
      sessionStorage.removeItem("dashboardData");
      // Navigate back to form
      navigate("/form");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-muted rounded flex items-center justify-center text-sm font-medium">
              FinTechCo
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-10 bg-muted rounded flex items-center justify-center text-sm font-medium">
              Claude Code
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="font-semibold text-primary">Step 1</span>
            <span>of</span>
            <span>2</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl shadow-lg border p-8 md:p-10 animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Connect Your Data Sources</h1>
            <p className="text-muted-foreground">
              We'll analyze your JIRA data to calculate productivity gains
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@fintechco.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jiraUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>JIRA Instance URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourcompany.atlassian.net" {...field} />
                    </FormControl>
                    <FormDescription>Base URL only (e.g., https://company.atlassian.net)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>JIRA Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="FinTechCo Backlog" {...field} />
                    </FormControl>
                    <FormDescription>The exact project name (use quotes if it has spaces)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>JIRA API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          placeholder="Enter your API key"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>We'll only use this to read ticket data</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="launchDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>When did you start using Claude Code?</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2023-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 gradient-copper hover:opacity-90"
                >
                  {isSubmitting ? "Submitting..." : "Analyze Data"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default DataForm;
