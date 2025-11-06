import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Activity, Send, Bot, User, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Health Coach. How can I help you with your health goals today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestedPrompts = [
    "What should I eat for breakfast?",
    "How can I increase my protein intake?",
    "Give me a quick workout routine",
    "Help me meal prep for the week",
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(input),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("breakfast")) {
      return "For a healthy breakfast, I recommend:\n\n1. Greek yogurt with berries and nuts (300 cal, 20g protein)\n2. Oatmeal with banana and almond butter (350 cal, 12g protein)\n3. Egg white omelet with vegetables (250 cal, 25g protein)\n\nThese options provide a good balance of protein, healthy fats, and complex carbs to start your day!";
    }

    if (lowerInput.includes("protein")) {
      return "Great question! Here are some excellent ways to increase protein:\n\n1. Add lean meats: chicken breast, turkey, fish (30-40g per serving)\n2. Include protein shakes between meals (20-30g per shake)\n3. Snack on Greek yogurt, cottage cheese, or nuts\n4. Try plant-based options: lentils, quinoa, tofu\n5. Add protein powder to smoothies or oatmeal\n\nAim for 0.8-1g of protein per pound of body weight daily!";
    }

    if (lowerInput.includes("workout")) {
      return "Here's a quick 20-minute full-body workout:\n\n1. Warm-up: 3 min jumping jacks\n2. Push-ups: 3 sets of 10-15\n3. Squats: 3 sets of 15-20\n4. Plank: 3 sets of 30-60 seconds\n5. Lunges: 3 sets of 10 per leg\n6. Burpees: 2 sets of 10\n7. Cool-down: 3 min stretching\n\nDo this 3-4 times per week for best results!";
    }

    if (lowerInput.includes("meal prep")) {
      return "Meal prep made easy! Here's a simple plan:\n\n**Sunday Prep:**\n1. Cook 4-5 chicken breasts\n2. Prepare 3 cups of brown rice\n3. Chop vegetables (broccoli, carrots, peppers)\n4. Make 2 types of sauce (teriyaki, lemon herb)\n\n**Monday-Friday:**\nMix and match proteins, rice, and veggies in containers. Each meal: ~400-500 calories, 30g protein.\n\nStore in fridge for 4-5 days. This saves time and keeps you on track!";
    }

    return "That's a great question! Based on your health goals, I recommend focusing on balanced nutrition with adequate protein, staying hydrated, and maintaining consistent meal timing. Would you like specific advice on meals, workouts, or tracking your progress?";
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">AI Health Coach</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Close
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        <div className="flex-1 overflow-y-auto space-y-6 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </Card>
              {message.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <Card className="max-w-[80%] p-4 bg-card">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Suggested prompts:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-3"
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about nutrition, fitness, or health..."
            className="flex-1"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} variant="hero">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AIChat;
