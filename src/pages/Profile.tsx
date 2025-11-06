import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Activity, User, Target, Utensils, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    target_weight_kg: "",
    daily_calorie_goal: "2000",
    daily_protein_goal: "120",
    daily_carbs_goal: "250",
    daily_fats_goal: "65",
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          age: data.age?.toString() || "",
          gender: data.gender || "",
          height_cm: data.height_cm?.toString() || "",
          weight_kg: data.weight_kg?.toString() || "",
          target_weight_kg: data.target_weight_kg?.toString() || "",
          daily_calorie_goal: data.daily_calorie_goal?.toString() || "2000",
          daily_protein_goal: data.daily_protein_goal?.toString() || "120",
          daily_carbs_goal: data.daily_carbs_goal?.toString() || "250",
          daily_fats_goal: data.daily_fats_goal?.toString() || "65",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
          daily_calorie_goal: parseInt(formData.daily_calorie_goal),
          daily_protein_goal: parseInt(formData.daily_protein_goal),
          daily_carbs_goal: parseInt(formData.daily_carbs_goal),
          daily_fats_goal: parseInt(formData.daily_fats_goal),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your health profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <Activity className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">AI Health Mentor</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground mb-8">Manage your health information and goals</p>

          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic information about you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="30"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      placeholder="175"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Health Goals
                </CardTitle>
                <CardDescription>Set your daily nutrition targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_weight_kg">Target Weight (kg)</Label>
                  <Input
                    id="target_weight_kg"
                    type="number"
                    step="0.1"
                    placeholder="65"
                    value={formData.target_weight_kg}
                    onChange={(e) => setFormData({ ...formData, target_weight_kg: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daily_calorie_goal">Daily Calories</Label>
                    <Input
                      id="daily_calorie_goal"
                      type="number"
                      value={formData.daily_calorie_goal}
                      onChange={(e) => setFormData({ ...formData, daily_calorie_goal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daily_protein_goal">Protein (g)</Label>
                    <Input
                      id="daily_protein_goal"
                      type="number"
                      value={formData.daily_protein_goal}
                      onChange={(e) => setFormData({ ...formData, daily_protein_goal: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daily_carbs_goal">Carbs (g)</Label>
                    <Input
                      id="daily_carbs_goal"
                      type="number"
                      value={formData.daily_carbs_goal}
                      onChange={(e) => setFormData({ ...formData, daily_carbs_goal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daily_fats_goal">Fats (g)</Label>
                    <Input
                      id="daily_fats_goal"
                      type="number"
                      value={formData.daily_fats_goal}
                      onChange={(e) => setFormData({ ...formData, daily_fats_goal: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" variant="hero" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
