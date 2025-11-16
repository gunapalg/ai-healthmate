-- Create agent_sessions table to track agent conversation sessions
CREATE TABLE IF NOT EXISTS public.agent_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'health_planning',
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_memory table for long-term memory about users
CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  importance INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, memory_type, key)
);

-- Create agent_actions table to log all agent actions
CREATE TABLE IF NOT EXISTS public.agent_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_goals table for user health objectives
CREATE TABLE IF NOT EXISTS public.health_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active',
  priority INTEGER DEFAULT 5,
  created_by TEXT DEFAULT 'agent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create intervention_history table to track agent interventions
CREATE TABLE IF NOT EXISTS public.intervention_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL,
  trigger_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendation TEXT NOT NULL,
  user_response TEXT,
  outcome TEXT,
  effectiveness_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all new tables
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_sessions
CREATE POLICY "Users can view own agent sessions"
  ON public.agent_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent sessions"
  ON public.agent_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent sessions"
  ON public.agent_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for agent_memory
CREATE POLICY "Users can view own agent memory"
  ON public.agent_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent memory"
  ON public.agent_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent memory"
  ON public.agent_memory FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for agent_actions
CREATE POLICY "Users can view own agent actions"
  ON public.agent_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent actions"
  ON public.agent_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agent actions"
  ON public.agent_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for health_goals
CREATE POLICY "Users can view own health goals"
  ON public.health_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health goals"
  ON public.health_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health goals"
  ON public.health_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health goals"
  ON public.health_goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for intervention_history
CREATE POLICY "Users can view own intervention history"
  ON public.intervention_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intervention history"
  ON public.intervention_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intervention history"
  ON public.intervention_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_agent_sessions_user_id ON public.agent_sessions(user_id);
CREATE INDEX idx_agent_sessions_status ON public.agent_sessions(status);
CREATE INDEX idx_agent_memory_user_id ON public.agent_memory(user_id);
CREATE INDEX idx_agent_memory_type ON public.agent_memory(memory_type);
CREATE INDEX idx_agent_actions_user_id ON public.agent_actions(user_id);
CREATE INDEX idx_agent_actions_session_id ON public.agent_actions(session_id);
CREATE INDEX idx_health_goals_user_id ON public.health_goals(user_id);
CREATE INDEX idx_health_goals_status ON public.health_goals(status);
CREATE INDEX idx_intervention_history_user_id ON public.intervention_history(user_id);

-- Trigger to update updated_at timestamps
CREATE TRIGGER update_agent_memory_updated_at
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_goals_updated_at
  BEFORE UPDATE ON public.health_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();