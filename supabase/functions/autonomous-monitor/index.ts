import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 Autonomous Monitor: Starting health data analysis...');

    // Get all active users with notifications enabled
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, autonomous_notifications_enabled, notification_frequency')
      .not('autonomous_notifications_enabled', 'is', null);

    if (profileError) throw profileError;

    const interventions = [];

    // Analyze each user's health data
    for (const profile of profiles || []) {
      if (profile.autonomous_notifications_enabled === false) continue;

      console.log(`Analyzing user ${profile.id}...`);

      // Get recent health data
      const { data: recentLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('log_date', { ascending: false })
        .limit(7);

      if (!recentLogs || recentLogs.length === 0) continue;

      // Check for concerning patterns
      const avgCalories = recentLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0) / recentLogs.length;
      const avgProtein = recentLogs.reduce((sum, log) => sum + (log.total_protein_g || 0), 0) / recentLogs.length;
      const avgSteps = recentLogs.reduce((sum, log) => sum + (log.steps || 0), 0) / recentLogs.length;
      const avgWater = recentLogs.reduce((sum, log) => sum + (log.water_glasses || 0), 0) / recentLogs.length;

      // Get user's goals
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('daily_calorie_goal, daily_protein_goal')
        .eq('id', profile.id)
        .single();

      // Detect issues and create interventions
      const issues = [];

      // Low calorie intake
      if (avgCalories < (userProfile?.daily_calorie_goal || 2000) * 0.7) {
        issues.push({
          type: 'alert',
          message: `Your average calorie intake (${Math.round(avgCalories)} cal) is significantly below your goal. This might affect your energy levels.`,
          priority: 8
        });
      }

      // Low protein intake
      if (avgProtein < (userProfile?.daily_protein_goal || 120) * 0.6) {
        issues.push({
          type: 'meal_recommendation',
          message: `Your protein intake is low (avg ${Math.round(avgProtein)}g). Consider adding protein-rich foods like chicken, fish, or legumes to your meals.`,
          priority: 7
        });
      }

      // Low water intake
      if (avgWater < 6) {
        issues.push({
          type: 'habit_change',
          message: `You're averaging ${Math.round(avgWater)} glasses of water per day. Try to increase to 8 glasses for better hydration.`,
          priority: 6
        });
      }

      // Low activity
      if (avgSteps < 5000) {
        issues.push({
          type: 'goal_suggestion',
          message: `Your step count is low (avg ${Math.round(avgSteps)} steps). Let's set a goal to gradually increase your daily activity.`,
          priority: 7
        });
      }

      // Get past intervention effectiveness to avoid repeating ineffective advice
      const { data: pastInterventions } = await supabase
        .from('intervention_history')
        .select('intervention_type, recommendation, effectiveness_score')
        .eq('user_id', profile.id)
        .not('effectiveness_score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      // Filter out intervention types that have been ineffective in the past
      const effectiveTypes = new Set(
        (pastInterventions || [])
          .filter(i => (i.effectiveness_score || 0) >= 3)
          .map(i => i.intervention_type)
      );

      const ineffectiveTypes = new Set(
        (pastInterventions || [])
          .filter(i => (i.effectiveness_score || 0) < 2)
          .map(i => i.intervention_type)
      );

      // Prioritize interventions that have worked before
      const filteredIssues = issues
        .filter(issue => !ineffectiveTypes.has(issue.type))
        .sort((a, b) => {
          const aEffective = effectiveTypes.has(a.type) ? 10 : 0;
          const bEffective = effectiveTypes.has(b.type) ? 10 : 0;
          return (b.priority + bEffective) - (a.priority + aEffective);
        });

      // Create top intervention
      if (filteredIssues.length > 0) {
        const topIssue = filteredIssues[0];
        
        const { error: interventionError } = await supabase
          .from('intervention_history')
          .insert({
            user_id: profile.id,
            intervention_type: topIssue.type,
            recommendation: topIssue.message,
            trigger_data: {
              avgCalories,
              avgProtein,
              avgSteps,
              avgWater,
              analysisDate: new Date().toISOString()
            }
          });

        if (!interventionError) {
          interventions.push({
            userId: profile.id,
            userName: profile.full_name,
            intervention: topIssue.message
          });
        }
      }
    }

    console.log(`✅ Created ${interventions.length} autonomous interventions`);

    return new Response(
      JSON.stringify({
        success: true,
        interventionsCreated: interventions.length,
        interventions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Autonomous Monitor Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
