import { supabase } from './supabase';
import { ChatMessage } from '../types';

export const chatService = {
  /**
   * Fetch messages for a project
   */
  async getMessages(projectId: string): Promise<{ data: ChatMessage[], error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return { data: [], error };
    }

    return { data: data as ChatMessage[], error: null };
  },

  /**
   * Send a message
   */
  async sendMessage(projectId: string, userId: string, userEmail: string, content: string, customName?: string): Promise<{ data: ChatMessage | null, error: any }> {
    const payload = {
      project_id: projectId,
      user_id: userId,
      user_email: userEmail,
      user_name: customName || userEmail.split('@')[0],
      content,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('messages')
      .insert([payload])
      .select();

    if (error) {
      console.error('Supabase error sending message:', error);
      return { data: null, error };
    }

    const newMessage = data && data.length > 0 ? (data[0] as ChatMessage) : null;
    return { data: newMessage, error: null };
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
    }
    return { error };
  },

  /**
   * Subscribe to message changes
   */
  subscribeToMessages(projectId: string, onEvent: (payload: any) => void) {
    return supabase
      .channel(`project_messages:${projectId}`)
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        onEvent(payload);
      })
      .subscribe();
  }
};
