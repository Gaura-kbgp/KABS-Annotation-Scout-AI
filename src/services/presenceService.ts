import { supabase } from './supabase';
import { User } from '../types';

export interface PresenceState {
  user_id: string;
  user_email: string;
  user_name: string;
  online_at: string;
}

export const presenceService = {
  /**
   * Track project presence
   */
  trackPresence(projectId: string, user: User, userName: string, onSync: (states: PresenceState[]) => void) {
    const channel = supabase.channel(`presence:${projectId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.values(newState).flat() as unknown as PresenceState[];
        onSync(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('leave', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            user_email: user.email,
            user_name: userName,
            online_at: new Date().toISOString(),
          });
        }
      });

    return channel;
  }
};
