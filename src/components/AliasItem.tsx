import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface AliasItemProps {
  alias: string;
  token: string;
  onUse: (token: string, alias: string) => void;
  isRemoving: boolean;
}

export const AliasItem = ({ alias, token, onUse, isRemoving }: AliasItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-secondary border border-border transition-all",
        isRemoving && "animate-fade-out"
      )}
    >
      <code className="text-sm text-foreground flex-1 font-mono break-all">
        {alias}
      </code>
      
      <Button
        size="sm"
        onClick={() => onUse(token, alias)}
        disabled={isRemoving}
        className="ml-4 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy & Use
      </Button>
    </div>
  );
};