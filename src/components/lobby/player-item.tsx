import { CrownIcon, UserXIcon } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PresenceDot } from "./presence-dot";

export type Player = {
  userId: string;
  teamNumber: number | null;
  user: { id: string; name: string };
};

export function PlayerItem({
  player,
  isYou,
  isHost,
  isOnline,
  canControl = false,
  currentTeam = null,
  teamNumbers = [],
  onSetTeam,
  onKick,
}: {
  player: Player;
  isYou: boolean;
  isHost: boolean;
  isOnline: boolean;
  canControl?: boolean;
  currentTeam?: number | null;
  teamNumbers?: number[];
  onSetTeam?: (team: number | null) => void;
  onKick?: () => void;
}) {
  return (
    <Item>
      <ItemMedia>
        <PresenceDot isOnline={isOnline} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {isHost && (
            <CrownIcon
              size={13}
              className="inline text-yellow-500 mr-1 shrink-0"
            />
          )}
          {player.user.name}
          {isYou && (
            <span className="text-muted-foreground font-normal"> (you)</span>
          )}
        </ItemTitle>
      </ItemContent>
      {((canControl && onSetTeam) || onKick) && (
        <ItemActions>
          {canControl && onSetTeam && (
            <Select
              value={currentTeam?.toString() ?? ""}
              onValueChange={(val) => onSetTeam(val ? parseInt(val) : null)}
            >
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue placeholder="Pick team" />
              </SelectTrigger>
              <SelectContent>
                {currentTeam !== null && (
                  <SelectItem value="">Unassign</SelectItem>
                )}
                {teamNumbers.map((t) => (
                  <SelectItem key={t} value={t.toString()}>
                    Team {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {onKick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onKick}
              title="Kick player"
            >
              <UserXIcon size={14} />
            </Button>
          )}
        </ItemActions>
      )}
    </Item>
  );
}
