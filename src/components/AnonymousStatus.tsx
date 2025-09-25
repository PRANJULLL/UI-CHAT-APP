import { UserX } from "lucide-react";

export function AnonymousStatus() {
  return (
    <div className="flex items-center justify-center px-6 py-3 bg-status-background border-t border-border/10">
      <div className="flex items-center space-x-2 text-status-text">
        <UserX className="h-4 w-4" />
        <span className="text-sm">Now you're appearing as Anonymous!</span>
        <UserX className="h-4 w-4" />
      </div>
    </div>
  );
}