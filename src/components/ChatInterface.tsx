import { useState, useRef, useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { AnonymousStatus } from "./AnonymousStatus";
import { useToast } from "@/hooks/use-toast";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  sender_name: string | null;
  is_anonymous: boolean | null;
}

export function ChatInterface() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { messages, loading, sendMessage, sending } = useMessages();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const channelId = 'fun-friday-group';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (sending) return; // avoid duplicates while sending

    await sendMessage(content, isAnonymous);
  };

  const handleBackClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  const handleSettingsClick = () => {
    toast({
      title: "Settings",
      description: `Anonymous mode: ${isAnonymous ? 'ON' : 'OFF'}`
    });
    setIsAnonymous(!isAnonymous);
  };

  const handleAttachFile = () => {
    // Trigger file picker for any file type
    if (fileInputRef.current) {
      fileInputRef.current.accept = "*/*";
      // remove capture to allow file selection
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleTakePhoto = () => {
    // Trigger file input with camera capture (mobile devices will open camera)
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast({ title: 'Uploading', description: `Uploading ${file.name}...` });

      const path = `${channelId}/${Date.now()}-${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({ title: 'Upload failed', description: uploadError.message || String(uploadError), variant: 'destructive' });
        // helpful hint if bucket missing
        if ((uploadError as any)?.status === 404) {
          toast({ title: 'Missing storage bucket', description: "Create a Supabase storage bucket named 'attachments' to enable uploads.", variant: 'destructive' });
        }
        return;
      }

      // Get public URL
      const { data: pub } = supabase.storage.from('attachments').getPublicUrl(path);
      const url = (pub as any)?.publicUrl ?? '';

      // create message payload as JSON string so we don't need DB schema changes
      const payload = JSON.stringify({ type: file.type.startsWith('image') ? 'image' : 'file', url, name: file.name, size: file.size, mime: file.type });

      await sendMessage(payload, isAnonymous);
      toast({ title: 'Uploaded', description: `${file.name} uploaded` });
    } catch (err) {
      console.error('Error uploading file:', err);
      toast({ title: 'Upload error', description: 'Failed to upload file', variant: 'destructive' });
    } finally {
      // reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen max-w-md mx-auto bg-chat-background items-center justify-center">
        <div className="text-chat-text-secondary">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-chat-background">
      {/* Header */}
      <ChatHeader
        groupName="Fun Friday Group"
        onBackClick={handleBackClick}
        onSettingsClick={handleSettingsClick}
      />

      {/* Auth Warning */}
      {!user && (
        <div className="px-4 py-2 bg-accent/20 border-b border-border/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-chat-text-secondary">Sign in to participate</span>
            <Button size="sm" variant="outline" onClick={() => navigate('/auth')}>
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={{
                  id: message.id,
                  content: message.content,
                  timestamp: new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  isOwn: user?.id === message.user_id,
                  sender: {
                    name: message.sender_name ?? (message.isSending ? 'You' : 'Anonymous'),
                    isAnonymous: message.sender_name == null && !message.isSending
                  },
                  isRead: true,
                }} 
              />
            ))}
      <div ref={messagesEndRef} />
    </div>

      {/* Anonymous Status */}
      {user && (
        <div className="px-4 py-2 bg-background/50 border-t border-border/10">
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
            <span className="text-xs text-chat-text-secondary">
              {isAnonymous ? "Now you're appearing as Anonymous!" : `Appearing as ${user.user_metadata?.display_name || 'User'}`}
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onAttachFile={handleAttachFile}
        onTakePhoto={handleTakePhoto}
        disabled={!user}
      />
    </div>
  );
}