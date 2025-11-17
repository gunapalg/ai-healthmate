// Memory management utilities for the health agent

interface MemoryItem {
  memory_type: string;
  key: string;
  value: any;
  importance: number;
}

export async function storeMemory(
  userId: string,
  memoryType: string,
  key: string,
  value: any,
  importance: number,
  supabase: any
) {
  try {
    const { data, error } = await supabase
      .from('agent_memory')
      .upsert({
        user_id: userId,
        memory_type: memoryType,
        key: key,
        value: value,
        importance: importance
      }, {
        onConflict: 'user_id,memory_type,key'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, memory: data };
  } catch (error) {
    console.error('Failed to store memory:', error);
    return { success: false, error };
  }
}

export async function getMemoriesByType(
  userId: string,
  memoryType: string,
  supabase: any
) {
  try {
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('user_id', userId)
      .eq('memory_type', memoryType)
      .order('importance', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to retrieve memories:', error);
    return [];
  }
}

export function extractPreferencesFromConversation(messages: any[]): MemoryItem[] {
  const preferences: MemoryItem[] = [];
  
  // Simple keyword-based extraction (can be enhanced with AI in future)
  const userMessages = messages.filter(m => m.role === 'user');
  
  for (const msg of userMessages) {
    const content = msg.content.toLowerCase();
    
    // Dietary preferences
    if (content.includes('vegetarian') || content.includes('vegan')) {
      preferences.push({
        memory_type: 'dietary_preference',
        key: 'diet_type',
        value: content.includes('vegan') ? 'vegan' : 'vegetarian',
        importance: 9
      });
    }
    
    // Meal timing preferences
    if (content.includes('breakfast') && (content.includes('early') || content.includes('morning'))) {
      preferences.push({
        memory_type: 'meal_timing',
        key: 'breakfast_preference',
        value: 'early_morning',
        importance: 6
      });
    }
    
    // Exercise preferences
    if (content.includes('gym') || content.includes('workout')) {
      preferences.push({
        memory_type: 'exercise_preference',
        key: 'workout_location',
        value: 'gym',
        importance: 7
      });
    }
  }
  
  return preferences;
}
