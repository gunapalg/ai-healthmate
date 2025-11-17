import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define available tools for the health agent
const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "analyze_health_trends",
      description: "Analyze user's recent health data to identify trends, patterns, and areas for improvement",
      parameters: {
        type: "object",
        properties: {
          days: {
            type: "number",
            description: "Number of days to analyze (default: 7)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_health_goal",
      description: "Create a new health goal for the user based on their profile and current progress",
      parameters: {
        type: "object",
        properties: {
          goal_type: {
            type: "string",
            enum: ["weight", "calories", "protein", "steps", "water", "streak"],
            description: "Type of health goal"
          },
          title: {
            type: "string",
            description: "Clear, motivating title for the goal"
          },
          description: {
            type: "string",
            description: "Detailed description of the goal"
          },
          target_value: {
            type: "number",
            description: "Target value to achieve"
          },
          unit: {
            type: "string",
            description: "Unit of measurement (kg, calories, g, steps, glasses, days)"
          },
          deadline_days: {
            type: "number",
            description: "Number of days from now to achieve the goal"
          },
          priority: {
            type: "number",
            description: "Priority level 1-10, where 10 is highest"
          }
        },
        required: ["goal_type", "title", "target_value", "unit"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_meal_plan",
      description: "Generate personalized meal suggestions based on user's goals, preferences, and dietary restrictions",
      parameters: {
        type: "object",
        properties: {
          meal_type: {
            type: "string",
            enum: ["breakfast", "lunch", "dinner", "snack"],
            description: "Type of meal to suggest"
          },
          calorie_target: {
            type: "number",
            description: "Target calories for the meal"
          },
          protein_focus: {
            type: "boolean",
            description: "Whether to prioritize high-protein options"
          }
        },
        required: ["meal_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "log_intervention",
      description: "Log a health intervention/recommendation made by the agent",
      parameters: {
        type: "object",
        properties: {
          intervention_type: {
            type: "string",
            enum: ["goal_suggestion", "meal_recommendation", "habit_change", "alert"],
            description: "Type of intervention"
          },
          recommendation: {
            type: "string",
            description: "The recommendation made to the user"
          },
          trigger_data: {
            type: "object",
            description: "Data that triggered this intervention"
          }
        },
        required: ["intervention_type", "recommendation"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_context",
      description: "Get comprehensive user context including profile, goals, recent activity, and preferences",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, sessionId } = await req.json();

    console.log('Health Agent request for user:', user.id);

    // Get or create agent session
    let session;
    if (sessionId) {
      const { data } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();
      session = data;
    }

    if (!session) {
      const { data } = await supabase
        .from('agent_sessions')
        .insert({
          user_id: user.id,
          session_type: 'health_planning',
          status: 'active'
        })
        .select()
        .single();
      session = data;
    }

    // Call Lovable AI Gateway with function calling
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an autonomous health planning agent with deep memory and contextual awareness. Your role is to:

1. **Analyze & Learn**: Study user's health patterns, preferences, and behaviors over time
2. **Personalized Goals**: Create SMART goals tailored to the user's lifestyle, preferences, and past successes
3. **Proactive Coaching**: Identify opportunities for improvement and suggest interventions before problems arise
4. **Meal Intelligence**: Recommend meals considering dietary preferences, past favorites, and nutritional gaps
5. **Progress Tracking**: Monitor goal progress and celebrate wins, while addressing setbacks compassionately

**Available Tools**:
- analyze_health_trends: Deep dive into recent health data to spot patterns
- create_health_goal: Set specific, measurable, achievable goals
- create_meal_plan: Generate personalized meal suggestions
- log_intervention: Record recommendations for future learning
- get_user_context: Access profile, goals, metrics, and learned preferences

**Communication Style**:
- Be encouraging and supportive, not judgmental
- Use data to back up recommendations
- Explain your reasoning clearly
- Ask clarifying questions when needed
- Celebrate progress and learn from setbacks
- Remember past conversations and preferences

**When to Take Action**:
- User asks for goal setting → Use create_health_goal
- User needs meal ideas → Use create_meal_plan
- You spot an important trend → Use log_intervention
- You need context to help → Use get_user_context
- Always analyze trends before making major recommendations`
          },
          ...messages
        ],
        tools: AGENT_TOOLS,
        tool_choice: "auto",
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please wait a moment and try again.',
            retryAfter: 60 
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': '60'
            } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI service quota exceeded. Please add credits to your Lovable workspace.',
            helpUrl: 'https://docs.lovable.dev/features/ai'
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const choice = aiResponse.choices[0];
    let finalMessage = choice.message;

    // Handle tool calls
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of choice.message.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`Executing tool: ${functionName}`, args);

        let result;
        try {
          result = await executeToolCall(functionName, args, user.id, supabase);
          
          // Log the action
          await supabase.from('agent_actions').insert({
            user_id: user.id,
            session_id: session.id,
            action_type: functionName,
            action_data: args,
            status: 'completed',
            result: result
          });

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result = { error: errorMessage };
          
          await supabase.from('agent_actions').insert({
            user_id: user.id,
            session_id: session.id,
            action_type: functionName,
            action_data: args,
            status: 'failed',
            result: { error: errorMessage }
          });
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result)
        });
      }

      // Make second call with tool results
      const followUpResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            ...messages,
            choice.message,
            ...toolResults
          ],
          stream: false,
        }),
      });

      const followUpData = await followUpResponse.json();
      finalMessage = followUpData.choices[0].message;
    }

    return new Response(
      JSON.stringify({ 
        message: finalMessage.content,
        sessionId: session.id,
        actions: choice.message.tool_calls?.map((tc: any) => tc.function.name) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in health-agent function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Tool execution functions
async function executeToolCall(functionName: string, args: any, userId: string, supabase: any) {
  switch (functionName) {
    case 'get_user_context':
      return await getUserContext(userId, supabase);
    
    case 'analyze_health_trends':
      return await analyzeHealthTrends(userId, args.days || 7, supabase);
    
    case 'create_health_goal':
      return await createHealthGoal(userId, args, supabase);
    
    case 'create_meal_plan':
      return await createMealPlan(userId, args, supabase);
    
    case 'log_intervention':
      return await logIntervention(userId, args, supabase);
    
    default:
      throw new Error(`Unknown tool: ${functionName}`);
  }
}

async function getUserContext(userId: string, supabase: any) {
  const [profileRes, goalsRes, metricsRes, memoryRes, recentInterventions] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('health_goals').select('*').eq('user_id', userId).eq('status', 'active'),
    supabase.from('health_metrics').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('agent_memory').select('*').eq('user_id', userId).order('importance', { ascending: false }).limit(10),
    supabase.from('intervention_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    profile: profileRes.data,
    active_goals: goalsRes.data || [],
    health_metrics: metricsRes.data,
    learned_preferences: memoryRes.data || [],
    recent_interventions: recentInterventions.data || [],
    context_summary: `User has ${goalsRes.data?.length || 0} active goals, ${memoryRes.data?.length || 0} learned preferences, and ${recentInterventions.data?.length || 0} recent interventions.`
  };
}

async function analyzeHealthTrends(userId: string, days: number, supabase: any) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: logs, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate.toISOString().split('T')[0])
    .order('log_date', { ascending: false });

  if (error) throw error;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  // Calculate averages and trends
  const avgCalories = logs.reduce((sum: number, log: any) => sum + (log.total_calories || 0), 0) / logs.length;
  const avgProtein = logs.reduce((sum: number, log: any) => sum + (log.total_protein_g || 0), 0) / logs.length;
  const avgSteps = logs.reduce((sum: number, log: any) => sum + (log.steps || 0), 0) / logs.length;
  const avgWater = logs.reduce((sum: number, log: any) => sum + (log.water_glasses || 0), 0) / logs.length;
  const avgHealthScore = logs.reduce((sum: number, log: any) => sum + (log.health_score || 0), 0) / logs.length;

  return {
    period_days: days,
    logs_count: logs.length,
    averages: {
      calories: Math.round(avgCalories),
      protein_g: Math.round(avgProtein),
      steps: Math.round(avgSteps),
      water_glasses: Math.round(avgWater * 10) / 10,
      health_score: Math.round(avgHealthScore)
    },
    goals: {
      calorie_goal: profile?.daily_calorie_goal,
      protein_goal: profile?.daily_protein_goal,
    },
    compliance: {
      calorie_compliance: profile?.daily_calorie_goal ? (avgCalories / profile.daily_calorie_goal * 100).toFixed(1) : null,
      protein_compliance: profile?.daily_protein_goal ? (avgProtein / profile.daily_protein_goal * 100).toFixed(1) : null,
    }
  };
}

async function createHealthGoal(userId: string, args: any, supabase: any) {
  const deadline = args.deadline_days 
    ? new Date(Date.now() + args.deadline_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null;

  const { data, error } = await supabase
    .from('health_goals')
    .insert({
      user_id: userId,
      goal_type: args.goal_type,
      title: args.title,
      description: args.description,
      target_value: args.target_value,
      unit: args.unit,
      deadline: deadline,
      priority: args.priority || 5,
      created_by: 'agent',
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;

  return { success: true, goal: data };
}

async function createMealPlan(userId: string, args: any, supabase: any) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('dietary_preferences, daily_calorie_goal, daily_protein_goal')
    .eq('id', userId)
    .maybeSingle();

  const calorieTarget = args.calorie_target || (profile?.daily_calorie_goal / 3);
  
  // This is a simplified meal suggestion - in production, you'd use a meal database
  const suggestions = {
    breakfast: [
      { name: "Greek yogurt with berries and granola", calories: 350, protein_g: 20 },
      { name: "Scrambled eggs with whole wheat toast and avocado", calories: 400, protein_g: 25 },
      { name: "Protein smoothie with banana and almond butter", calories: 380, protein_g: 30 }
    ],
    lunch: [
      { name: "Grilled chicken salad with quinoa", calories: 450, protein_g: 35 },
      { name: "Turkey and avocado wrap with vegetables", calories: 420, protein_g: 30 },
      { name: "Salmon bowl with brown rice and vegetables", calories: 480, protein_g: 38 }
    ],
    dinner: [
      { name: "Lean steak with sweet potato and broccoli", calories: 550, protein_g: 45 },
      { name: "Baked chicken with roasted vegetables", calories: 500, protein_g: 42 },
      { name: "Grilled fish with quinoa and asparagus", calories: 480, protein_g: 40 }
    ],
    snack: [
      { name: "Apple with almond butter", calories: 200, protein_g: 8 },
      { name: "Protein bar and handful of nuts", calories: 220, protein_g: 15 },
      { name: "Cottage cheese with fruit", calories: 180, protein_g: 18 }
    ]
  };

  const mealOptions = suggestions[args.meal_type as keyof typeof suggestions] || suggestions.lunch;
  
  return {
    meal_type: args.meal_type,
    target_calories: calorieTarget,
    suggestions: mealOptions,
    dietary_preferences: profile?.dietary_preferences || []
  };
}

async function logIntervention(userId: string, args: any, supabase: any) {
  const { data, error } = await supabase
    .from('intervention_history')
    .insert({
      user_id: userId,
      intervention_type: args.intervention_type,
      recommendation: args.recommendation,
      trigger_data: args.trigger_data || {}
    })
    .select()
    .single();

  if (error) throw error;

  return { success: true, intervention: data };
}
