import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft, Eye, EyeOff } from "lucide-react";
import fintechLogo from "@/assets/fintechco-logo.png";
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
      launchDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    // Store form data in session storage for the dashboard
    sessionStorage.setItem("formData", JSON.stringify(values));
    
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    navigate("/loading");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <img src={fintechLogo} alt="FinTech Co" className="h-10" />
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
                      <Input placeholder="https://fintechco.atlassian.net" {...field} />
                    </FormControl>
                    <FormDescription>Your company's JIRA domain</FormDescription>
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
