import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  BookOpen,
  Users,
  Cpu,
  Zap,
  Shield,
  Target,
  TrendingUp,
  MessageSquare,
  Bell,
  Star,
  Activity
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface Section {
  id: string;
  title: string;
  icon: any;
  content?: string[];
  subsections?: { title: string; content: string[] }[];
}

const helpSections: Section[] = [
  {
    id: "overview",
    title: "What Is This?",
    icon: BookOpen,
    content: [
      "Imagine having a personal health coach who:",
      "• Never sleeps - monitors your health 24/7",
      "• Learns from you - remembers what works and what doesn't",
      "• Proactively helps - notices problems before you do",
      "• Gets smarter over time - improves recommendations based on your feedback",
      "",
      "That's exactly what the Autonomous Health Planner Agent does!"
    ]
  },
  {
    id: "features",
    title: "Key Features",
    icon: Zap,
    subsections: [
      {
        title: "1. Real-Time Monitoring",
        content: [
          "The agent constantly checks your health data:",
          "• When you log a meal → Checks if you're meeting nutrition goals",
          "• When you log steps → Checks if you're active enough",
          "• When you log water → Checks hydration levels",
          "",
          "Uses Supabase Realtime subscriptions to detect changes instantly."
        ]
      },
      {
        title: "2. Conversational AI",
        content: [
          "Chat naturally like texting a friend:",
          "• Ask: 'I need breakfast ideas'",
          "• Get: Personalized response based on your profile, goals, and past meals",
          "",
          "Powered by Google Gemini 2.5 Flash model via Lovable AI Gateway.",
          "",
          "The AI can:",
          "• Answer questions about your health data",
          "• Analyze trends ('You've been eating less protein lately')",
          "• Create meal plans",
          "• Set goals",
          "• Give encouragement"
        ]
      },
      {
        title: "3. Function Calling (Agent Tools)",
        content: [
          "The AI can take specific actions, not just talk:",
          "",
          "Example: You say 'Help me increase my protein intake'",
          "",
          "AI thinks:",
          "  1. Check current protein levels (analyze_health_trends tool)",
          "  2. Create a protein goal (create_health_goal tool)",
          "  3. Suggest high-protein meals (create_meal_plan tool)",
          "",
          "Available Tools:",
          "• analyze_health_trends - Look at past data",
          "• create_health_goal - Set new goals",
          "• create_meal_plan - Suggest meals",
          "• log_intervention - Save suggestions",
          "• get_user_context - Get user profile info"
        ]
      },
      {
        title: "4. Memory System",
        content: [
          "The agent remembers your preferences:",
          "✓ Dietary preferences (vegetarian, allergic to nuts, etc.)",
          "✓ Meal timing ('prefers breakfast at 8am')",
          "✓ Exercise habits ('goes to gym on Mondays')",
          "✓ Past conversations",
          "✓ What suggestions helped you",
          "",
          "Privacy: Memories are ONLY yours - no other user can see them."
        ]
      },
      {
        title: "5. Background Processing",
        content: [
          "The agent works even when you're not using the app:",
          "",
          "How it works:",
          "1. Agent runs automatically (every hour or daily)",
          "2. Checks all users' health data",
          "3. For each user:",
          "   - Calculates averages (calories, protein, steps, water)",
          "   - Compares to goals",
          "   - Identifies issues",
          "4. If problem found:",
          "   - Creates personalized suggestion",
          "   - Saves to database",
          "5. Next time you open app:",
          "   - You see the suggestion waiting"
        ]
      },
      {
        title: "6. Learning from Feedback",
        content: [
          "The agent gets smarter based on your ratings:",
          "",
          "The Feedback Loop:",
          "1. Agent suggests: 'Try having eggs for breakfast'",
          "2. You rate it 5 stars",
          "3. Next time agent needs breakfast suggestions:",
          "   → Sees eggs got 5 stars",
          "   → More likely to suggest eggs again",
          "4. If you rate something 1 star:",
          "   → Agent remembers 'User doesn't like this'",
          "   → Won't suggest it again"
        ]
      }
    ]
  },
  {
    id: "how-to-use",
    title: "How to Use It",
    icon: Users,
    subsections: [
      {
        title: "Step 1: Go to the Health Agent Page",
        content: [
          "• Open the app",
          "• Click on 'Health Agent' or 'AI Coach' in the menu"
        ]
      },
      {
        title: "Step 2: Start Chatting",
        content: [
          "Type questions or requests in the chat box.",
          "",
          "Examples:",
          "• 'Help me reach my protein goal'",
          "• 'Create a meal plan for tomorrow'",
          "• 'Why is my health score low today?'"
        ]
      },
      {
        title: "Step 3: Check Your Dashboard",
        content: [
          "On the right side, you'll see:",
          "• Active Goals: What you're working on",
          "• Recent Suggestions: What the agent recommended"
        ]
      },
      {
        title: "Step 4: Rate Suggestions (Important!)",
        content: [
          "When you see a suggestion, click the stars:",
          "• 5 stars = 'This really helped me!'",
          "• 1 star = 'This didn't work for me'",
          "",
          "This teaches the agent what YOU like."
        ]
      },
      {
        title: "Step 5: Set Your Preferences",
        content: [
          "Go to Profile → Notification Settings",
          "",
          "Choose:",
          "• How often you want suggestions (real-time, daily, weekly)",
          "• What types of help you want (meal ideas, goal suggestions, habit tips)",
          "• Turn notifications on/off completely"
        ]
      }
    ]
  },
  {
    id: "how-it-works",
    title: "How It Works",
    icon: Cpu,
    content: [
      "When you log a meal:",
      "",
      "Step 1: You upload photo → App analyzes image → Saves nutrition data",
      "Step 2: Agent detects new meal → 'Let me check user's progress...'",
      "Step 3: Agent reads today's meals, goals, and time",
      "Step 4: Agent calculates: Am I on track? Behind? Ahead?",
      "Step 5: Agent decides: Should I intervene NOW or wait?",
      "Step 6: If yes, generates personalized suggestion",
      "Step 7: You see notification and can rate it",
      "Step 8: Agent learns from your rating for next time"
    ]
  },
  {
    id: "autonomous",
    title: "What Makes It 'Autonomous'?",
    icon: Target,
    content: [
      "Traditional App vs. Autonomous Agent:",
      "",
      "Traditional:",
      "• You manually log meals",
      "• You remember to check goals",
      "• You search for meal ideas",
      "• Generic advice for everyone",
      "",
      "Autonomous Agent:",
      "• Notices you logged a meal and checks if you're on track",
      "• Reminds you when you're falling behind",
      "• Suggests meals based on your needs RIGHT NOW",
      "• Personalized advice that learns from YOUR feedback",
      "",
      "Analogy:",
      "Regular app = A notebook where you write things down",
      "Autonomous agent = A personal assistant who reads your notebook, notices patterns, and proactively helps you"
    ]
  },
  {
    id: "privacy",
    title: "Privacy & Control",
    icon: Shield,
    subsections: [
      {
        title: "What You Control",
        content: [
          "Full Control Over Notifications:",
          "• Enable/disable autonomous suggestions",
          "• Choose frequency: Realtime, Daily, or Weekly",
          "• Select types: Goal suggestions, Meal recommendations, Habit changes, Health alerts",
          "",
          "Data You Can Delete:",
          "• All conversations (delete any time)",
          "• All goals (remove any time)",
          "• All ratings (change ratings any time)",
          "• Your entire account (permanently delete everything)"
        ]
      },
      {
        title: "What the Agent CAN'T Do",
        content: [
          "✗ Share your data with other users",
          "✗ Post on your behalf without asking",
          "✗ Change your goals without permission",
          "✗ Access your data when you're logged out",
          "✗ Override your manual changes"
        ]
      },
      {
        title: "Data Security",
        content: [
          "Where Your Data Lives:",
          "• Database: Supabase (enterprise-grade security)",
          "• Encrypted: All data encrypted at rest and in transit",
          "• Access: Only YOU can see your health data",
          "• AI Processing: Happens securely in edge functions",
          "",
          "What Gets Shared with AI:",
          "• Your health metrics (for analysis)",
          "• Your conversations (for context)",
          "• Your preferences (for personalization)",
          "",
          "What NEVER Gets Shared:",
          "• Your data with other users",
          "• Identifying information with AI training data",
          "• Your passwords or payment info"
        ]
      }
    ]
  },
  {
    id: "tips",
    title: "Pro Tips for Success",
    icon: TrendingUp,
    content: [
      "Getting Started Checklist:",
      "",
      "✓ Day 1-3: Just log meals, get comfortable",
      "✓ Day 4-7: Start rating suggestions (teach the agent!)",
      "✓ Week 2: Set your first goal with agent help",
      "✓ Week 3: Customize notification preferences",
      "✓ Week 4: Check progress, celebrate improvements!",
      "",
      "Best Practices:",
      "1. Rate Everything - The more you rate, the smarter it gets",
      "2. Be Consistent - Log daily for best results",
      "3. Ask Questions - Use the chat for anything health-related",
      "4. Adjust Settings - Change notification frequency if needed",
      "5. Trust the Process - Takes 2-3 weeks to learn your patterns",
      "",
      "Success Metrics:",
      "✓ Suggestions feel more relevant each week",
      "✓ You hit your goals more often",
      "✓ You spend less time thinking about what to eat",
      "✓ Your health score trends upward",
      "✓ You feel supported, not nagged"
    ]
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    icon: MessageSquare,
    subsections: [
      {
        title: "Does the agent read my mind?",
        content: [
          "No! It only sees data you manually log (meals, steps, water). It makes educated guesses based on patterns."
        ]
      },
      {
        title: "Can I turn it off?",
        content: [
          "Yes! Go to Profile → Notification Settings → Disable autonomous suggestions. You can still use the chat feature."
        ]
      },
      {
        title: "How is this different from a regular fitness app?",
        content: [
          "Regular apps show you data. This agent actively analyzes, suggests, and learns. It's like having a coach vs. having a spreadsheet."
        ]
      },
      {
        title: "Will it spam me with notifications?",
        content: [
          "No. You control frequency (realtime/daily/weekly) and types of suggestions. Rate suggestions low if you get too many - it learns!"
        ]
      },
      {
        title: "Is my data private?",
        content: [
          "Yes. Your data is encrypted and never shared with other users. Only you and the AI (for your benefit) can see it."
        ]
      },
      {
        title: "What if it gives wrong advice?",
        content: [
          "Rate it 1 star and it won't repeat that mistake. The agent is a helper, not a replacement for doctors. Always consult professionals for medical advice."
        ]
      },
      {
        title: "Can I delete my data?",
        content: [
          "Yes, completely. Account settings → Delete account removes everything permanently."
        ]
      },
      {
        title: "What happens if I don't rate suggestions?",
        content: [
          "The agent assumes they're neutral (3 stars). It's better to rate so it learns faster!"
        ]
      }
    ]
  }
];

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("overview");

  const filteredSections = useMemo(() => {
    if (!searchQuery) return helpSections;

    const query = searchQuery.toLowerCase();
    return helpSections.filter(section => {
      const titleMatch = section.title.toLowerCase().includes(query);
      const contentMatch = section.content.some(c => c.toLowerCase().includes(query));
      const subsectionMatch = section.subsections?.some(sub =>
        sub.title.toLowerCase().includes(query) ||
        sub.content.some(c => c.toLowerCase().includes(query))
      );
      return titleMatch || contentMatch || subsectionMatch;
    });
  }, [searchQuery]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">Help & Documentation</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24 shadow-health-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {helpSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => scrollToSection(section.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="text-sm">{section.title}</span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <Card className="shadow-health-sm">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Found {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Content Sections */}
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-6 pr-4">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Card key={section.id} id={section.id} className="shadow-health-sm scroll-mt-24">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <CardTitle className="text-2xl">{section.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {section.content && section.content.length > 0 && (
                          <div className="space-y-2">
                            {section.content.map((line, idx) => (
                              <p
                                key={idx}
                                className={`${
                                  line.startsWith("•") || line.startsWith("✓") || line.startsWith("✗")
                                    ? "ml-4 text-foreground/90"
                                    : line.trim() === ""
                                    ? "h-2"
                                    : "text-foreground"
                                }`}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        )}

                        {section.subsections && (
                          <div className="space-y-6 mt-6">
                            {section.subsections.map((subsection, subIdx) => (
                              <div key={subIdx}>
                                <Separator className="my-4" />
                                <h3 className="text-lg font-semibold mb-3 text-primary">
                                  {subsection.title}
                                </h3>
                                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                                  {subsection.content.map((line, lineIdx) => (
                                    <p
                                      key={lineIdx}
                                      className={`${
                                        line.startsWith("•") || line.startsWith("✓") || line.startsWith("✗")
                                          ? "ml-4 text-foreground/90"
                                          : line.trim() === ""
                                          ? "h-2"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {filteredSections.length === 0 && (
                  <Card className="shadow-health-sm">
                    <CardContent className="py-12 text-center">
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No results found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search query
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Access Badges */}
                <Card className="shadow-health-sm bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Quick Access
                    </CardTitle>
                    <CardDescription>Jump to commonly accessed sections</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => scrollToSection("how-to-use")}
                      >
                        How to Use
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => scrollToSection("features")}
                      >
                        Features
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => scrollToSection("privacy")}
                      >
                        Privacy
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => scrollToSection("faq")}
                      >
                        FAQ
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => scrollToSection("tips")}
                      >
                        Pro Tips
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
