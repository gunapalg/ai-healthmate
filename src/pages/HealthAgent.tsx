import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Bot, User, Target, TrendingUp, Sparkles, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: string[];
}

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: string;
  priority: number;
  deadline: string | null;
}

export default function HealthAgent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI Health Planning Agent. I can analyze your health data, create personalized goals, suggest meals, and help you stay on track. What would you like to work on today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeGoals, setActiveGoals] = useState<HealthGoal[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadActiveGoals();
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadActiveGoals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("health_goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("priority", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error loading goals:", error);
      return;
    }

    setActiveGoals(data || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("health-agent", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        actions: data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Reload goals if agent created new ones
      if (data.actions?.includes("create_health_goal")) {
        await loadActiveGoals();
      }

    } catch (error: any) {
      console.error("Error calling health agent:", error);
      toast.error(error.message || "Failed to get response from agent");
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create_health_goal":
        return <Target className="h-3 w-3" />;
      case "analyze_health_trends":
        return <TrendingUp className="h-3 w-3" />;
      case "create_meal_plan":
        return <Sparkles className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bot className="h-8 w-8 text-primary" />
              Health Planning Agent
            </h1>
            <p className="text-muted-foreground">Your AI-powered health companion</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <Card className="lg:col-span-2 p-6 flex flex-col h-[600px]">
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {message.actions.map((action, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {getActionIcon(action)}
                              <span className="ml-1">
                                {action.replace(/_/g, " ")}
                              </span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to analyze your progress, create goals, suggest meals..."
                className="resize-none"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Active Goals Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Active Goals
              </h3>
              
              {activeGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active goals yet. Ask the agent to create personalized goals for you!
                </p>
              ) : (
                <div className="space-y-3">
                  {activeGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <Badge variant={goal.priority > 7 ? "destructive" : "secondary"}>
                          P{goal.priority}
                        </Badge>
                      </div>
                      
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {goal.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Target: {goal.target_value} {goal.unit}
                        </span>
                        {goal.deadline && (
                          <span className="text-muted-foreground">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold text-sm mb-2">💡 Try asking:</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• "Analyze my health trends from the past week"</li>
                <li>• "Create a weight loss goal for me"</li>
                <li>• "Suggest healthy dinner options"</li>
                <li>• "What should I focus on to improve my health score?"</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
