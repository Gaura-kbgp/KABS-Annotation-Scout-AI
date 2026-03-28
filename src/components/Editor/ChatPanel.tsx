import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User as UserIcon, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { presenceService, PresenceState } from '../../services/presenceService';
import { ChatMessage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ChatPanelProps {
  projectId: string;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ projectId, onClose }) => {
  const { user, profile } = useAuth();
  
  if (!user) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [displayName, setDisplayName] = useState(
      localStorage.getItem(`chat_name_${user.email}`) || 
      profile?.full_name || 
      user.email.split('@')[0]
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const channel = chatService.subscribeToMessages(projectId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setMessages((prev) => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as ChatMessage];
        });
      } else if (payload.eventType === 'DELETE') {
        setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
      }
    });

    // Track Presence
    const presenceChannel = presenceService.trackPresence(projectId, user, displayName, (states) => {
      setOnlineUsers(states);
    });

    return () => {
      channel.unsubscribe();
      presenceChannel.unsubscribe();
    };
  }, [projectId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await chatService.getMessages(projectId);
    if (!error) {
      setMessages(data);
    } else {
      setError("Failed to load history. Ensure database migration is applied.");
      console.error(error);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteMessage = async (messageId: string) => {
    console.log('Attempting to delete message:', messageId);
    const { error } = await chatService.deleteMessage(messageId);
    if (error) {
      console.error('Delete error:', error);
      setError("Failed to delete message");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');

    const { error } = await chatService.sendMessage(projectId, user.id, user.email, content, displayName);
    if (error) {
      console.error('Failed to send message:', error);
      if (error.code === '42703' || error.message.includes('user_name')) {
         setError("Database column 'user_name' is missing. Please run the updated SQL migration.");
      } else {
         setError(error.message || "Failed to send message");
      }
      setTimeout(() => setError(null), 6000);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-dark-800 border-l border-dark-700 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-500/10 rounded-lg text-brand-500">
            <MessageSquare size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white tracking-wide leading-none">Team Chat</span>
            <div className="flex items-center gap-1 mt-1 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                {isEditingName ? (
                    <input 
                        autoFocus
                        value={displayName}
                        onChange={(e) => {
                            setDisplayName(e.target.value);
                            localStorage.setItem(`chat_name_${user.email}`, e.target.value);
                        }}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                        className="bg-dark-900 border border-brand-500 rounded px-1.5 py-0.5 text-[10px] text-brand-400 outline-none w-24"
                    />
                ) : (
                    <>
                        <span className="text-[10px] text-brand-400 font-medium hover:text-brand-300 transition-colors">
                            Sending as: <span className="underline decoration-dotted">{displayName}</span>
                        </span>
                    </>
                )}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 text-gray-500 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Online Users */}
      <div className="px-4 py-2 border-b border-dark-700 bg-dark-800/50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Online —</span>
        <div className="flex -space-x-1.5 overflow-visible">
          {onlineUsers.map((u, index) => (
            <div 
              key={`${u.user_id}-${index}`} 
              className="w-6 h-6 rounded-full border-2 border-dark-800 bg-dark-700 flex items-center justify-center text-brand-400 relative group transition-transform hover:scale-110 hover:z-10"
              title={`${u.user_name} (${u.user_email})`}
            >
              <UserIcon size={12} />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-dark-800 shadow-sm"></span>
              
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                <div className="bg-dark-900/95 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded shadow-2xl whitespace-nowrap border border-dark-600 font-medium">
                  {u.user_name}
                </div>
              </div>
            </div>
          ))}
        </div>
        {onlineUsers.length > 0 && (
          <span className="text-[10px] text-gray-400 ml-1 font-medium italic">
            {onlineUsers.length} online
          </span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center gap-2 text-[11px] text-red-400 animate-in slide-in-from-top duration-200">
          <AlertCircle size={14} className="shrink-0" />
          <span className="truncate">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-200">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
            <Loader2 size={24} className="animate-spin text-brand-500" />
            <span className="text-xs font-medium">Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-dark-700/50 rounded-full flex items-center justify-center mb-4 text-gray-600">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No messages yet</h3>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">
              Start a discussion with your team about this project.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.user_id === user.id;
            return (
              <div key={message.id} className={`flex flex-col group ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-1.5 mb-1.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!isOwn && (
                    <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center">
                      <UserIcon size={12} className="text-brand-400" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-gray-400">
                    {isOwn 
                      ? 'You' 
                      : (message.user_name 
                          ? message.user_name.charAt(0).toUpperCase() + message.user_name.slice(1)
                          : message.user_email.split('@')[0].charAt(0).toUpperCase() + message.user_email.split('@')[0].slice(1)
                        )
                    }
                  </span>
                  <span className="text-[10px] text-gray-600 font-medium">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isOwn && (
                    <button 
                      onClick={() => handleDeleteMessage(message.id)}
                      className="p-1 px-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-dark-700 rounded-md cursor-pointer pointer-events-auto"
                      title="Unsend"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div 
                  className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm transition-all duration-200 ${
                    isOwn 
                      ? 'bg-brand-600 text-white rounded-tr-none hover:bg-brand-500' 
                      : 'bg-dark-700 text-gray-200 rounded-tl-none hover:bg-dark-600'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-dark-700 bg-dark-800/95">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-dark-900 border border-dark-600 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all placeholder-gray-600 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-2.5 bg-brand-600 hover:bg-brand-500 active:scale-95 disabled:opacity-50 disabled:bg-gray-700 disabled:scale-100 text-white rounded-xl transition-all shadow-lg shadow-brand-500/10 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
