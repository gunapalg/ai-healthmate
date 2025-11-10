-- Create conversations table for AI chat
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('user', 'assistant')) NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = chat_messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = chat_messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create ai_request_logs table
CREATE TABLE public.ai_request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  model text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.ai_request_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI logs"
  ON public.ai_request_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI logs"
  ON public.ai_request_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create wearable_connections table
CREATE TABLE public.wearable_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider text CHECK (provider IN ('fitbit', 'garmin', 'apple_health', 'google_fit')) NOT NULL,
  access_token text,
  refresh_token text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable connections"
  ON public.wearable_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wearable connections"
  ON public.wearable_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wearable connections"
  ON public.wearable_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wearable connections"
  ON public.wearable_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create health_data_sync table
CREATE TABLE public.health_data_sync (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL,
  sync_date date NOT NULL,
  steps integer,
  calories_burned integer,
  sleep_hours numeric,
  heart_rate_avg integer,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, provider, sync_date)
);

ALTER TABLE public.health_data_sync ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health data sync"
  ON public.health_data_sync FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data sync"
  ON public.health_data_sync FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wearable_connections_updated_at
  BEFORE UPDATE ON public.wearable_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();