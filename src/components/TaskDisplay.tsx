import { cn } from "@/lib/utils";

interface TaskDisplayProps {
  task: string;
  mode: "normal" | "addition" | "subtraction";
}

export const TaskDisplay = ({ task, mode }: TaskDisplayProps) => {
  if (mode === "normal") {
    return (
      <div className="bg-card rounded-3xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="text-lg md:text-xl font-semibold text-muted-foreground mb-2">
            🎯 Show this number on the abacus:
          </div>
          <div className="text-5xl md:text-6xl font-bold text-primary tabular-nums">
            {task}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto">
      <div className="text-center">
        <div className="text-lg md:text-xl font-semibold text-muted-foreground mb-4">
          {mode === "addition" ? "➕ Solve this addition:" : "➖ Solve this subtraction:"}
        </div>
        <div className="text-4xl md:text-5xl font-bold text-foreground tabular-nums">
          {task}
        </div>
        <div className="text-base md:text-lg text-muted-foreground mt-4">
          Set the answer on the bottom abacus
        </div>
      </div>
    </div>
  );
};
