import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  sender?: {
    name: string;
    avatar?: string;
    isAnonymous: boolean;
  };
  isRead?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { content, timestamp, isOwn, sender, isRead } = message;
  // content may be a plain string or a JSON string describing an attachment
  let parsedContent: any = null;
  try {
    parsedContent = JSON.parse(content);
  } catch (e) {
    parsedContent = null;
  }

  if (isOwn) {
    // Sent message (right-aligned, red background, sharp top-right corner)
    return (
      <div className="flex justify-end mb-4 pr-4">
        <div className="flex flex-col items-end max-w-[80%]">
          <div 
            className={cn(
              "px-4 py-2 rounded-2xl rounded-tr-md shadow-sm",
              "bg-message-sent text-message-sent-text"
            )}
          >
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
          <div className="flex items-center mt-1 space-x-1">
            <span className="text-xs text-status-text">{timestamp}</span>
            {isRead ? (
              <CheckCheck className="h-3 w-3 text-blue-400" />
            ) : (
              <Check className="h-3 w-3 text-status-text" />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Received message (left-aligned, gray background, sharp top-left corner)
  return (
    <div className="flex mb-4 pl-4">
      <div className="flex space-x-3 max-w-[80%]">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-2">
          {sender?.avatar ? (
            <img
              src={sender.avatar}
              alt={sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-avatar-anonymous flex items-center justify-center">
              {sender?.isAnonymous !== false && (
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              )}
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className="flex flex-col">
          <div 
            className={cn(
              "px-4 py-2 rounded-2xl rounded-tl-md shadow-sm",
              "bg-message-received text-message-received-text"
            )}
          >
            {sender && !sender.isAnonymous && (
              <p className="text-xs font-medium text-message-received-text/80 mb-1">
                {sender.name}
              </p>
            )}
            {sender?.isAnonymous && (
              <p className="text-xs font-medium text-message-received-text/80 mb-1">
                Anonymous
              </p>
            )}
            {parsedContent && parsedContent.type === 'image' ? (
              <img src={parsedContent.url} alt={parsedContent.name} className="max-w-xs rounded-md object-cover" />
            ) : parsedContent && parsedContent.type === 'file' ? (
              <a href={parsedContent.url} target="_blank" rel="noreferrer" className="text-sm underline">
                {parsedContent.name}
              </a>
            ) : (
              <p className="text-sm leading-relaxed">{content}</p>
            )}
          </div>
          <span className="text-xs text-status-text mt-1 ml-1">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}