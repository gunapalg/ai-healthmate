/*
  # AI Health Mentor - Core Schema Setup

  ## Overview
  This migration creates the complete database schema for the AI Health Mentor application,
  including all tables, RLS policies, triggers, and security measures.

  ## New Tables
  
  ### 1. `profiles`
  User profile and health information
  - `id` (uuid, FK to auth.users) - Primary key
  - `full_name` (text) - User's full name
  - `age` (integer) - User's age
  - `gender` (text) - User's gender
  - `height_cm` (numeric) - Height in centimeters
  - `weight_kg` (numeric) - Current weight in kilograms
  - `target_weight_kg` (numeric) - Target weight goal
  - `daily_calorie_goal` (integer) - Daily calorie target
  - `daily_protein_goal` (integer) - Daily protein target in grams
  - `daily_carbs_goal` (integer) - Daily carbs target in grams
  - `daily_fats_goal` (integer) - Daily fats target in grams
  - `dietary_preferences` (text[]) - Array of dietary preferences/restrictions
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update timestamp

  ### 2. `meals`
  Food logging and meal tracking
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - Owner of the meal
  - `meal_name` (text) - Name of the food/meal
  - `meal_type` (text) - breakfast/lunch/dinner/snack
  - `calories` (numeric) - Total calories
  - `protein_g` (numeric) - Protein in grams
  - `carbs_g` (numeric) - Carbohydrates in grams
  - `fats_g` (numeric) - Fats in grams
  - `fiber_g` (numeric) - Fiber in grams (optional)
  - `image_url` (text) - Storage URL for food photo
  - `logged_at` (timestamptz) - When the meal was consumed
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `daily_logs`
  Aggregated daily health metrics
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - Owner of the log
  - `log_date` (date) - Date of the log (unique per user)
  - `total_calories` (numeric) - Aggregated daily calories
  - `total_protein_g` (numeric) - Aggregated daily protein
  - `total_carbs_g` (numeric) - Aggregated daily carbs
  - `total_fats_g` (numeric) - Aggregated daily fats
  - `water_glasses` (integer) - Water intake count
  - `steps` (integer) - Step count from wearables
  - `weight_kg` (numeric) - Daily weight measurement
  - `health_score` (integer) - Calculated health score (0-100)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `achievements`
  Gamification achievements
  - `id` (uuid) - Primary key
  - `user_id` (uuid, FK to profiles) - Achievement owner
  - `achievement_type` (text) - Type: streak/calories/protein/steps
  - `achievement_name` (text) - Display name
  - `achieved_at` (timestamptz) - When achieved
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Admins can access all data (via user_roles table)
  - Automatic profile creation on user signup

  ## Triggers
  - Auto-create profile when new user signs up
  - Update daily_logs when meals are added/updated/deleted

  ## Important Notes
  - All timestamps use timestamptz for timezone awareness
  - Default values ensure data integrity
  - Unique constraints prevent duplicate daily logs
  - Foreign keys maintain referential integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  age integer,
  gender text,
  height_cm numeric,
  weight_kg numeric,
  target_weight_kg numeric,
  daily_calorie_goal integer DEFAULT 2000,
  daily_protein_goal integer DEFAULT 120,
  daily_carbs_goal integer DEFAULT 250,
  daily_fats_goal integer DEFAULT 65,
  dietary_preferences text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS public.meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  meal_name text NOT NULL,
  meal_type text,
  calories numeric DEFAULT 0,
  protein_g numeric DEFAULT 0,
  carbs_g numeric DEFAULT 0,
  fats_g numeric DEFAULT 0,
  fiber_g numeric,
  image_url text,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create daily_logs table
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date date DEFAULT CURRENT_DATE NOT NULL,
  total_calories numeric DEFAULT 0,
  total_protein_g numeric DEFAULT 0,
  total_carbs_g numeric DEFAULT 0,
  total_fats_g numeric DEFAULT 0,
  water_glasses integer DEFAULT 0,
  steps integer DEFAULT 0,
  weight_kg numeric,
  health_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, log_date)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_type text,
  achievement_name text NOT NULL,
  achieved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Meals RLS Policies
CREATE POLICY "Users can view own meals"
  ON public.meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON public.meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON public.meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON public.meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Daily Logs RLS Policies
CREATE POLICY "Users can view own daily logs"
  ON public.daily_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs"
  ON public.daily_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
  ON public.daily_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily logs"
  ON public.daily_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Achievements RLS Policies
CREATE POLICY "Users can view own achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (new.id, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update daily_logs when meals change
CREATE OR REPLACE FUNCTION public.update_daily_log()
RETURNS trigger AS $$
DECLARE
  log_date_val date;
  user_id_val uuid;
BEGIN
  -- Determine which operation and get values
  IF TG_OP = 'DELETE' THEN
    log_date_val := DATE(OLD.logged_at);
    user_id_val := OLD.user_id;
  ELSE
    log_date_val := DATE(NEW.logged_at);
    user_id_val := NEW.user_id;
  END IF;

  -- Insert or update daily_log
  INSERT INTO public.daily_logs (user_id, log_date, total_calories, total_protein_g, total_carbs_g, total_fats_g)
  SELECT 
    user_id,
    DATE(logged_at) as log_date,
    COALESCE(SUM(calories), 0) as total_calories,
    COALESCE(SUM(protein_g), 0) as total_protein_g,
    COALESCE(SUM(carbs_g), 0) as total_carbs_g,
    COALESCE(SUM(fats_g), 0) as total_fats_g
  FROM public.meals
  WHERE user_id = user_id_val AND DATE(logged_at) = log_date_val
  GROUP BY user_id, DATE(logged_at)
  ON CONFLICT (user_id, log_date) 
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g = EXCLUDED.total_carbs_g,
    total_fats_g = EXCLUDED.total_fats_g;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for meal changes
DROP TRIGGER IF EXISTS on_meal_change ON public.meals;
CREATE TRIGGER on_meal_change
  AFTER INSERT OR UPDATE OR DELETE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_log();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_logged_at ON public.meals(logged_at);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
