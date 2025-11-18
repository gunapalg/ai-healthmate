-- Add notification preferences columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS autonomous_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('realtime', 'daily', 'weekly')),
ADD COLUMN IF NOT EXISTS goal_suggestions BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS meal_recommendations BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS habit_changes BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS alerts BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.autonomous_notifications_enabled IS 'Enable or disable autonomous health agent notifications';
COMMENT ON COLUMN profiles.notification_frequency IS 'How often to receive agent notifications: realtime, daily, or weekly';
COMMENT ON COLUMN profiles.goal_suggestions IS 'Receive goal suggestions from the agent';
COMMENT ON COLUMN profiles.meal_recommendations IS 'Receive meal recommendations from the agent';
COMMENT ON COLUMN profiles.habit_changes IS 'Receive habit change suggestions from the agent';
COMMENT ON COLUMN profiles.alerts IS 'Receive health alerts from the agent';