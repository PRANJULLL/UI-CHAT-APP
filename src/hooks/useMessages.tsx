import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  channel_id: string;
  // client-only flags
  isSending?: boolean;
  isFailed?: boolean;
  // optional resolved sender info (populated client-side)
  sender_name?: string | null;
  sender_avatar?: string | null;
}

export function useMessages(channelId: string = 'fun-friday-group') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(current => [...current, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(current =>
            current.map(msg =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const msgs = (data || []) as Message[];

      // fetch profiles for the messages' user_ids to resolve display names
      const userIds = Array.from(new Set(msgs.map((m) => m.user_id)));
      let profiles: { user_id: string; display_name: string | null; avatar_url: string | null }[] = [];
      if (userIds.length) {
        const { data: pData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);
        profiles = (pData as any) || [];
      }

      const enriched = msgs.map((m) => {
        const p = profiles.find((p) => p.user_id === m.user_id);
        return {
          ...m,
          sender_name: p?.display_name ?? null,
          sender_avatar: p?.avatar_url ?? null,
        } as Message;
      });

      setMessages(enriched);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, isAnonymous: boolean = false) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive",
      });
      return;
    }

    // optimistic message
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content,
      created_at: new Date().toISOString(),
      user_id: user.id,
      channel_id: channelId,
      isSending: true,
      isFailed: false,
      sender_name: isAnonymous ? 'Anonymous' : user.user_metadata?.display_name ?? 'You',
      sender_avatar: user.user_metadata?.avatar_url ?? null,
    };

    setMessages((cur) => [...cur, tempMessage]);
    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        content,
        user_id: user.id,
        channel_id: channelId,
      });

      if (error) {
        throw error;
      }

      // Refresh authoritative data from server to replace temp messages
      await fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });

      // mark temp message as failed
      setMessages((cur) => cur.map((m) => (m.id === tempId ? { ...m, isSending: false, isFailed: true } : m)));
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    sending,
    refetch: fetchMessages,
  };
}