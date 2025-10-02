import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDisplayProps {
  isCorrect: boolean | null;
  correctAnswer?: number;
}

export const FeedbackDisplay = ({ isCorrect, correctAnswer }: FeedbackDisplayProps) => {
  if (isCorrect === null) return null;

  return (
    <div
      className={cn(
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in fade-in zoom-in duration-500",
        "bg-card rounded-3xl shadow-2xl p-8 md:p-12 max-w-md mx-4"
      )}
    >
      {isCorrect ? (
        <div className="text-center">
          <CheckCircle className="w-20 h-20 md:w-24 md:h-24 text-[hsl(var(--success))] mx-auto mb-4 animate-bounce" />
          <div className="text-3xl md:text-4xl font-bold text-[hsl(var(--success))] mb-2">
            🎉 Correct!
          </div>
          <div className="text-lg md:text-xl text-muted-foreground">
            Great job! You got it right!
          </div>
        </div>
      ) : (
        <div className="text-center">
          <XCircle className="w-20 h-20 md:w-24 md:h-24 text-[hsl(var(--error))] mx-auto mb-4 animate-pulse" />
          <div className="text-3xl md:text-4xl font-bold text-[hsl(var(--error))] mb-2">
            Try Again!
          </div>
          <div className="text-lg md:text-xl text-muted-foreground mb-3">
            Not quite right. Keep trying!
          </div>
          {correctAnswer !== undefined && (
            <div className="text-base text-muted-foreground">
              The correct answer is: <span className="font-bold text-foreground">{correctAnswer.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
