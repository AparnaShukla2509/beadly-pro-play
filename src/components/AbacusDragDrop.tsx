import { useState, useEffect, DragEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BeadPosition {
  count: number; // Number of beads activated (0-5)
}

interface AbacusDragDropProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  label?: string;
  showValue?: boolean;
}

const PLACE_VALUES = [
  { name: "Hundreds", value: 100, label: "(100)", bengali: "শতক" },
  { name: "Tens", value: 10, label: "(10)", bengali: "দশক" },
  { name: "Ones", value: 1, label: "(1)", bengali: "একক" },
  { name: "Tenths", value: 0.1, label: "(0.1)", bengali: "দশমাংশ" },
  { name: "Hundredths", value: 0.01, label: "(0.01)", bengali: "শতাংশ" },
];

const BEAD_COLORS = [
  "bg-[hsl(var(--bead-1))]",
  "bg-[hsl(var(--bead-2))]",
  "bg-[hsl(var(--bead-3))]",
  "bg-[hsl(var(--bead-4))]",
  "bg-[hsl(var(--bead-5))]",
];

export const AbacusDragDrop = ({ value = 0, onChange, readonly = false, label, showValue = true }: AbacusDragDropProps) => {
  const { toast } = useToast();
  const [beadPositions, setBeadPositions] = useState<BeadPosition[]>([
    { count: 0 },
    { count: 0 },
    { count: 0 },
    { count: 0 },
    { count: 0 },
  ]);
  const [draggedBead, setDraggedBead] = useState<{ rodIndex: number; beadIndex: number } | null>(null);

  useEffect(() => {
    const positions = valueToBeadPositions(value);
    setBeadPositions(positions);
  }, [value]);

  const valueToBeadPositions = (val: number): BeadPosition[] => {
    const positions: BeadPosition[] = [];
    let remaining = Math.round(val * 100) / 100;

    PLACE_VALUES.forEach((place) => {
      const count = Math.floor(remaining / place.value);
      const effectiveCount = Math.min(count, 5); // Max 5 beads per rod
      
      positions.push({ count: effectiveCount });
      
      remaining -= effectiveCount * place.value;
      remaining = Math.round(remaining * 100) / 100;
    });

    return positions;
  };

  const beadPositionsToValue = (positions: BeadPosition[]): number => {
    let total = 0;
    positions.forEach((pos, index) => {
      total += pos.count * PLACE_VALUES[index].value;
    });
    return Math.round(total * 100) / 100;
  };

  const handleDragStart = (e: DragEvent, rodIndex: number, beadIndex: number) => {
    if (readonly) return;
    setDraggedBead({ rodIndex, beadIndex });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent) => {
    if (readonly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent, targetRodIndex: number) => {
    if (readonly || !draggedBead) return;
    e.preventDefault();
    
    const newPositions = [...beadPositions];
    // Increment the target rod's count
    if (newPositions[targetRodIndex].count < 5) {
      newPositions[targetRodIndex] = { count: newPositions[targetRodIndex].count + 1 };
      setBeadPositions(newPositions);
      onChange?.(beadPositionsToValue(newPositions));
      toast({ title: "Bead added!" });
    }
    
    setDraggedBead(null);
  };

  const handleReset = () => {
    if (readonly) return;
    const resetPositions = [
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
    ];
    setBeadPositions(resetPositions);
    onChange?.(0);
    toast({ title: "Reset complete!" });
  };

  const calculatedValue = beadPositionsToValue(beadPositions);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {label && (
        <div className="text-lg font-bold text-foreground bg-card px-6 py-2 rounded-full shadow-md">
          {label}
        </div>
      )}

      {/* Drag source area with Reset button */}
      {!readonly && (
        <div className="bg-card rounded-3xl shadow-xl p-6 w-full max-w-2xl">
          <div className="text-center space-y-4">
            <p className="text-base md:text-lg font-semibold text-muted-foreground">
              🎯 Interactive Abacus - Drag & Drop Feature
            </p>
            <p className="text-sm text-muted-foreground">
              Click beads to add/remove • Drag beads between rods • Use reset to clear
            </p>
            <Button 
              onClick={handleReset}
              variant="outline"
              className="w-full md:w-auto"
            >
              Reset All Beads
            </Button>
          </div>
        </div>
      )}
      
      <div className="relative bg-[hsl(var(--abacus-board))] rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-2xl">
        {/* Abacus rods */}
        <div className="grid grid-cols-5 gap-2 md:gap-4 mb-6">
          {PLACE_VALUES.map((place, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Rod container with drop zone */}
              <div 
                className="relative flex flex-col items-center w-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Vertical rod */}
                <div className="absolute w-1 md:w-2 h-80 md:h-96 bg-[hsl(var(--abacus-rod))] rounded-full top-0" />
                
                {/* All beads (5 beads total, each with same value) */}
                <div className="relative z-10 flex flex-col items-center justify-start gap-2 pt-4 w-full h-80 md:h-96">
                  {[0, 1, 2, 3, 4].map((beadIndex) => (
                    <div
                      key={beadIndex}
                      draggable={!readonly && beadIndex < beadPositions[index].count}
                      onDragStart={(e) => handleDragStart(e, index, beadIndex)}
                      onClick={() => {
                        if (!readonly) {
                          const newPositions = [...beadPositions];
                          const currentCount = newPositions[index].count;
                          
                          // Toggle bead: if clicking an active bead or below, set to that position
                          if (beadIndex < currentCount) {
                            newPositions[index] = { count: beadIndex };
                          } else {
                            newPositions[index] = { count: beadIndex + 1 };
                          }
                          
                          setBeadPositions(newPositions);
                          onChange?.(beadPositionsToValue(newPositions));
                        }
                      }}
                      className={cn(
                        "w-12 h-12 md:w-16 md:h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                        BEAD_COLORS[index],
                        beadIndex < beadPositions[index].count ? "opacity-100 cursor-grab active:cursor-grabbing" : "opacity-30",
                        !readonly && "cursor-pointer hover:brightness-110"
                      )}
                      title={beadIndex < beadPositions[index].count ? `Drag to move or click to remove` : `Click to add`}
                    />
                  ))}
                </div>
              </div>

              {/* Place value label */}
              <div className="mt-4 text-center">
                <div className="text-xs md:text-sm font-bold text-foreground/90">
                  {place.name}
                </div>
                <div className="text-xs text-foreground/70">{place.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Value display */}
        {showValue && (
          <div className="text-center mt-6">
            <div className="inline-block bg-card px-8 py-3 rounded-2xl shadow-lg">
              <div className="text-3xl md:text-4xl font-bold text-foreground tabular-nums">
                {calculatedValue.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
