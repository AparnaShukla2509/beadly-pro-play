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
  { name: "Hundreds", value: 100, label: "(100)", bengali: "শতক (100)" },
  { name: "Tens", value: 10, label: "(10)", bengali: "দশক (10)" },
  { name: "Ones", value: 1, label: "(1)", bengali: "একক (1)" },
  { name: "Tenths", value: 0.1, label: "(0.1)", bengali: "দশমাংশ (0.1)" },
  { name: "Hundredths", value: 0.01, label: "(0.01)", bengali: "শতাংশ (0.01)" },
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
      const effectiveCount = Math.min(count, 9); // Max 9 beads per rod
      
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

  const handleDragStart = (e: DragEvent, rodIndex: number) => {
    if (readonly) return;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", `new-bead-${rodIndex}`);
  };

  const handleDragOver = (e: DragEvent) => {
    if (readonly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: DragEvent, targetRodIndex: number) => {
    if (readonly) return;
    e.preventDefault();
    
    const dragData = e.dataTransfer.getData("text/plain");
    if (dragData.startsWith("new-bead-")) {
      const sourceRodIndex = parseInt(dragData.split("-")[2]);
      if (sourceRodIndex === targetRodIndex) {
        const newPositions = [...beadPositions];
        if (newPositions[targetRodIndex].count < 9) {
          newPositions[targetRodIndex] = { count: newPositions[targetRodIndex].count + 1 };
          setBeadPositions(newPositions);
          onChange?.(beadPositionsToValue(newPositions));
        }
      }
    }
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
  };

  const handleRemoveLastBead = () => {
    if (readonly) return;
    const newPositions = [...beadPositions];
    for (let i = newPositions.length - 1; i >= 0; i--) {
      if (newPositions[i].count > 0) {
        newPositions[i] = { count: newPositions[i].count - 1 };
        setBeadPositions(newPositions);
        onChange?.(beadPositionsToValue(newPositions));
        break;
      }
    }
  };

  const calculatedValue = beadPositionsToValue(beadPositions);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {label && (
        <div className="text-lg font-bold text-foreground bg-card px-6 py-2 rounded-full shadow-md">
          {label}
        </div>
      )}

      {/* Drag source area */}
      {!readonly && (
        <div className="bg-card rounded-2xl shadow-lg p-4 md:p-8 w-full max-w-2xl">
          <div className="text-center space-y-3 md:space-y-4">
            <p className="text-sm md:text-base text-muted-foreground font-semibold">
              এখান থেকে টেনে আনো
            </p>
            <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {PLACE_VALUES.map((place, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, index)}
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full shadow-xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform touch-none",
                      BEAD_COLORS[index]
                    )}
                  />
                  <p className="text-xs sm:text-sm font-medium text-foreground text-center leading-tight">
                    {place.bengali.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="relative bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl md:rounded-3xl p-4 md:p-8 lg:p-12 shadow-2xl w-full max-w-2xl">
        {/* Abacus rods */}
        <div className="flex gap-2 sm:gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-6 justify-center items-start">
          {PLACE_VALUES.map((place, index) => (
            <>
              <div key={index} className="flex flex-col items-center">
                {/* Rod container with drop zone */}
                <div 
                  className="relative flex flex-col items-center w-full min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px]"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Vertical rod */}
                  <div className="absolute w-1.5 sm:w-2 md:w-3 h-full bg-gray-600 rounded-full top-0" />
                  
                  {/* Beads on rod - shown as colored beads */}
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-3 pt-2 md:pt-4 w-full h-full">
                    {Array.from({ length: beadPositions[index].count }).map((_, beadIndex) => (
                      <div
                        key={beadIndex}
                        onClick={() => {
                          if (!readonly) {
                            const newPositions = [...beadPositions];
                            newPositions[index] = { count: Math.max(0, newPositions[index].count - 1) };
                            setBeadPositions(newPositions);
                            onChange?.(beadPositionsToValue(newPositions));
                          }
                        }}
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-125 active:scale-110",
                          BEAD_COLORS[index],
                          !readonly && "cursor-pointer touch-none"
                        )}
                        title="Click to remove"
                      />
                    ))}
                  </div>
                </div>

                {/* Place value label */}
                <div className="mt-2 md:mt-4 text-center">
                  <div className="text-xs sm:text-sm md:text-base font-bold text-gray-800 leading-tight">
                    {place.bengali}
                  </div>
                </div>
              </div>
              
              {/* Decimal point separator after ones place (index 2) */}
              {index === 2 && (
                <div className="flex items-center self-center" style={{ marginBottom: '60px' }}>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-gray-800 shadow-lg" />
                </div>
              )}
            </>
          ))}
        </div>
      </div>

      {/* Value display */}
      {showValue && (
        <div className="text-center">
          <div className="inline-block bg-card px-6 md:px-12 py-3 md:py-4 rounded-2xl shadow-lg">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tabular-nums">
              {calculatedValue.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!readonly && (
        <div className="flex gap-3 md:gap-4 flex-wrap justify-center">
          <Button 
            onClick={handleRemoveLastBead}
            className="bg-orange-600 hover:bg-orange-700 text-white text-base md:text-lg px-6 md:px-10 py-4 md:py-6 rounded-xl shadow-lg touch-none"
          >
            সংশোধন করো
          </Button>
          <Button 
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white text-base md:text-lg px-8 md:px-12 py-4 md:py-6 rounded-xl shadow-lg touch-none"
          >
            আবার করো
          </Button>
        </div>
      )}
    </div>
  );
};
