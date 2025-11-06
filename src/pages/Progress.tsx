import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Activity, TrendingUp, Award, Calendar, Target } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Progress = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("week");

  const calorieData = [
    { date: "Mon", consumed: 1800, target: 2000 },
    { date: "Tue", consumed: 2100, target: 2000 },
    { date: "Wed", consumed: 1950, target: 2000 },
    { date: "Thu", consumed: 1850, target: 2000 },
    { date: "Fri", consumed: 2200, target: 2000 },
    { date: "Sat", consumed: 2000, target: 2000 },
    { date: "Sun", consumed: 1900, target: 2000 },
  ];

  const macroData = [
    { name: "Protein", value: 120, color: "#5DD39E" },
    { name: "Carbs", value: 250, color: "#38A3A5" },
    { name: "Fats", value: 65, color: "#F6C445" },
  ];

  const weightData = [
    { week: "Week 1", weight: 75 },
    { week: "Week 2", weight: 74.5 },
    { week: "Week 3", weight: 74 },
    { week: "Week 4", weight: 73.5 },
  ];

  const achievements = [
    { id: 1, name: "7-Day Streak", icon: "🔥", earned: true },
    { id: 2, name: "Protein Goal", icon: "💪", earned: true },
    { id: 3, name: "Water Champion", icon: "💧", earned: true },
    { id: 4, name: "Early Bird", icon: "🌅", earned: false },
    { id: 5, name: "10K Steps", icon: "👟", earned: true },
    { id: 6, name: "Meal Prep Master", icon: "🍱", earned: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">AI Health Mentor</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground">Track your health journey over time</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Daily Calories
                  </CardTitle>
                  <CardDescription>Consumed vs Target</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={calorieData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="consumed"
                        stroke="#5DD39E"
                        strokeWidth={2}
                        name="Consumed"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#38A3A5"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Weight Progress
                  </CardTitle>
                  <CardDescription>Last 4 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[72, 76]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#5DD39E"
                        strokeWidth={2}
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Progress to goal</p>
                    <p className="text-2xl font-bold text-primary">-1.5 kg</p>
                    <p className="text-xs text-muted-foreground mt-1">3.5 kg remaining</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Activity Streak
                </CardTitle>
                <CardDescription>Keep it up!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-6xl font-bold gradient-primary bg-clip-text text-transparent">
                    7
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">Days</p>
                    <p className="text-sm text-muted-foreground">Current streak</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mt-6">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg gradient-primary flex items-center justify-center"
                    >
                      <span className="text-2xl">🔥</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Macro Distribution</CardTitle>
                  <CardDescription>Today's macronutrient breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}g`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {macroData.map((macro) => (
                      <div key={macro.name} className="text-center">
                        <div
                          className="w-4 h-4 rounded-full mx-auto mb-2"
                          style={{ backgroundColor: macro.color }}
                        />
                        <p className="text-sm font-semibold">{macro.name}</p>
                        <p className="text-xs text-muted-foreground">{macro.value}g</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Summary</CardTitle>
                  <CardDescription>Average daily intake</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Calories</span>
                      <span className="text-sm text-muted-foreground">1957 / 2000</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="gradient-primary h-2 rounded-full"
                        style={{ width: "98%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Protein</span>
                      <span className="text-sm text-muted-foreground">115 / 120g</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="gradient-primary h-2 rounded-full"
                        style={{ width: "96%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Carbs</span>
                      <span className="text-sm text-muted-foreground">245 / 250g</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="gradient-primary h-2 rounded-full"
                        style={{ width: "98%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Fats</span>
                      <span className="text-sm text-muted-foreground">62 / 65g</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="gradient-primary h-2 rounded-full"
                        style={{ width: "95%" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Your Achievements
                </CardTitle>
                <CardDescription>Keep earning badges!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`text-center p-6 ${
                        achievement.earned
                          ? "border-primary/50 shadow-health-sm"
                          : "opacity-50 grayscale"
                      }`}
                    >
                      <div className="text-5xl mb-3">{achievement.icon}</div>
                      <p className="font-semibold">{achievement.name}</p>
                      {achievement.earned && (
                        <p className="text-xs text-primary mt-2">Earned!</p>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-2">Total Progress</p>
                  <p className="text-5xl font-bold mb-2">67%</p>
                  <p className="text-sm opacity-90">to next level</p>
                  <div className="w-full bg-primary-foreground/20 rounded-full h-3 mt-4">
                    <div
                      className="bg-primary-foreground h-3 rounded-full"
                      style={{ width: "67%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Progress;
