import { supabase } from '../../../lib/supabase';

export type StartPathChoice = 'CREATE_TEAM' | 'JOIN_TEAM' | 'EXPLORE';

export async function bootstrapCurrentUser() {
  const { data, error } = await supabase.rpc('bootstrap_current_user');

  if (error) {
    throw error;
  }

  return data;
}

export async function getMe() {
  const { data, error } = await supabase.rpc('get_me');

  if (error) {
    throw error;
  }

  return data;
}

export async function completeStartPathChoice(choice: StartPathChoice) {
  const { data, error } = await supabase.rpc('complete_start_path_choice', {
    p_choice: choice,
  });

  if (error) {
    throw error;
  }

  return data;
}
