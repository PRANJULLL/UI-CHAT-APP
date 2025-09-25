import { useState } from "react";
import { Send, Camera, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onAttachFile: () => void;
  onTakePhoto: () => void;
  disabled?: boolean;
}
export function ChatInput({
  onSendMessage,
  onAttachFile,
  onTakePhoto,
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return <div className="px-4 py-4 bg-chat-background border-t border-border/20">
      <div className="flex items-center space-x-3">
        {/* Input Field */}
        <div className="flex-1 relative">
          <Input 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            onKeyPress={handleKeyPress} 
            placeholder={disabled ? "Sign in to send messages..." : "Type a message ..."} 
            className="pr-20 rounded-full text-input-text placeholder:text-input-placeholder border-0 focus:ring-2 focus:ring-accent/50 text-sm py-3 bg-neutral-950" 
            disabled={disabled}
          />
          
          {/* Inline Action Buttons */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onTakePhoto} className="h-8 w-8 text-icon-primary hover:bg-accent/10 rounded-full">
              <Camera className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onAttachFile} className="h-8 w-8 text-icon-primary hover:bg-accent/10 rounded-full">
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Send Button */}
        <Button onClick={handleSend} disabled={!message.trim() || disabled} className="rounded-full h-12 w-12 bg-accent hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground p-0">
          <Send className="h-5 w-5 text-white" />
        </Button>
      </div>
    </div>;
}