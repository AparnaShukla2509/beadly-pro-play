import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type GameMode = "normal" | "addition" | "subtraction";

interface GameControlsProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onReset: () => void;
  onCheck: () => void;
  onNewTask: () => void;
  showCheck: boolean;
}

export const GameControls = ({
  mode,
  onModeChange,
  onReset,
  onCheck,
  onNewTask,
  showCheck,
}: GameControlsProps) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Mode selector */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          onClick={() => onModeChange("normal")}
          variant={mode === "normal" ? "default" : "outline"}
          size="lg"
          className={cn(
            "flex-1 text-base md:text-lg font-bold rounded-2xl transition-all",
            mode === "normal" && "shadow-lg scale-105"
          )}
        >
          🎮 Normal Mode
        </Button>
        <Button
          onClick={() => onModeChange("addition")}
          variant={mode === "addition" ? "default" : "outline"}
          size="lg"
          className={cn(
            "flex-1 text-base md:text-lg font-bold rounded-2xl transition-all",
            mode === "addition" && "shadow-lg scale-105"
          )}
        >
          ➕ Addition
        </Button>
        <Button
          onClick={() => onModeChange("subtraction")}
          variant={mode === "subtraction" ? "default" : "outline"}
          size="lg"
          className={cn(
            "flex-1 text-base md:text-lg font-bold rounded-2xl transition-all",
            mode === "subtraction" && "shadow-lg scale-105"
          )}
        >
          ➖ Subtraction
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={onNewTask}
          size="lg"
          variant="secondary"
          className="flex-1 max-w-xs text-base md:text-lg font-bold rounded-2xl"
        >
          🎲 New Task
        </Button>
        
        {showCheck && (
          <Button
            onClick={onCheck}
            size="lg"
            className="flex-1 max-w-xs text-base md:text-lg font-bold rounded-2xl bg-secondary hover:bg-secondary/90"
          >
            <Check className="mr-2 h-5 w-5" />
            Check Answer
          </Button>
        )}
        
        <Button
          onClick={onReset}
          size="lg"
          variant="outline"
          className="text-base md:text-lg font-bold rounded-2xl"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
