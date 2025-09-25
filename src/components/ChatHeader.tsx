import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  groupName: string;
  onBackClick: () => void;
  onSettingsClick: () => void;
}

export function ChatHeader({ groupName, onBackClick, onSettingsClick }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-chat-header border-b border-border/20">
      {/* Left side - Back button and group info */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackClick}
          className="text-foreground hover:bg-white/10 h-8 w-8"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-3">
          {/* Group Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">FG</span>
              </div>
            </div>
          </div>
          
          {/* Group Name */}
          <div>
            <h1 className="text-foreground font-medium text-lg">{groupName}</h1>
          </div>
        </div>
      </div>
      
      {/* Right side - Settings */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onSettingsClick}
        className="text-icon-accent hover:bg-white/10 h-10 w-10 rounded-full bg-accent"
      >
        <Settings className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
}