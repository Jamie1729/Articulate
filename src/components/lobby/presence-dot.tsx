import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PresenceDot({ isOnline }: { isOnline: boolean }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <span
              className={cn(
                "size-2 rounded-full shrink-0",
                isOnline ? "bg-green-500" : "bg-gray-300",
              )}
            />
          }
        />
        <TooltipContent>
          {isOnline ? "Connected" : "Disconnected"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
