import { MoreVertical, Eye, Trash2, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

/**
 * Actions menu for estimates
 * Shows different actions based on context (active list vs trash)
 */
export function EstimateActionsMenu({
  estimateId,
  isInTrash = false,
  onViewDetails,
  onMoveToTrash,
  onRestore,
  locationId,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => e.stopPropagation()}
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onViewDetails && (
          <DropdownMenuItem onSelect={(e) => {
            e.stopPropagation();
            onViewDetails(estimateId);
          }}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {isInTrash ? (
          <>
            {onViewDetails && <DropdownMenuSeparator />}
            {onRestore && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.stopPropagation();
                  onRestore(estimateId, locationId);
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <>
            {onViewDetails && <DropdownMenuSeparator />}
            {onMoveToTrash && (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.stopPropagation();
                  onMoveToTrash(estimateId, locationId);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Move to Trash
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

