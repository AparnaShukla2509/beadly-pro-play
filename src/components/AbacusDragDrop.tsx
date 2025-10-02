import { useState, useEffect, DragEvent } from "react";
import { cn } from "@/lib/utils";

interface BeadPosition {
  top: boolean;
  bottom: number;
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
  const [beadPositions, setBeadPositions] = useState<BeadPosition[]>([
    { top: false, bottom: 0 },
    { top: false, bottom: 0 },
    { top: false, bottom: 0 },
    { top: false, bottom: 0 },
    { top: false, bottom: 0 },
  ]);
  const [draggedBeadType, setDraggedBeadType] = useState<"top" | "bottom" | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ rod: number; type: "top" | "bottom" } | null>(null);

  useEffect(() => {
    const positions = valueToBeadPositions(value);
    setBeadPositions(positions);
  }, [value]);

  const valueToBeadPositions = (val: number): BeadPosition[] => {
    const positions: BeadPosition[] = [];
    let remaining = Math.round(val * 100) / 100;

    PLACE_VALUES.forEach((place) => {
      const count = Math.floor(remaining / place.value);
      const effectiveCount = Math.min(count, 9);
      
      if (effectiveCount >= 5) {
        positions.push({ top: true, bottom: effectiveCount - 5 });
      } else {
        positions.push({ top: false, bottom: effectiveCount });
      }
      
      remaining -= effectiveCount * place.value;
      remaining = Math.round(remaining * 100) / 100;
    });

    return positions;
  };

  const beadPositionsToValue = (positions: BeadPosition[]): number => {
    let total = 0;
    positions.forEach((pos, index) => {
      const topValue = pos.top ? 5 : 0;
      const bottomValue = pos.bottom;
      total += (topValue + bottomValue) * PLACE_VALUES[index].value;
    });
    return Math.round(total * 100) / 100;
  };

  const handleDragStart = (e: DragEvent, type: "top" | "bottom") => {
    if (readonly) return;
    setDraggedBeadType(type);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", type);
  };

  const handleDragOver = (e: DragEvent, rodIndex: number, type: "top" | "bottom") => {
    if (readonly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverIndex({ rod: rodIndex, type });
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: DragEvent, rodIndex: number, type: "top" | "bottom") => {
    if (readonly) return;
    e.preventDefault();
    
    const newPositions = [...beadPositions];
    
    if (type === "top") {
      // Toggle top bead
      newPositions[rodIndex] = { ...newPositions[rodIndex], top: !newPositions[rodIndex].top };
    } else {
      // Add bottom bead
      const currentBottom = newPositions[rodIndex].bottom;
      newPositions[rodIndex] = { ...newPositions[rodIndex], bottom: Math.min(currentBottom + 1, 4) };
    }
    
    setBeadPositions(newPositions);
    const newValue = beadPositionsToValue(newPositions);
    onChange?.(newValue);
    
    setDraggedBeadType(null);
    setDragOverIndex(null);
  };

  const handleRemoveBead = (rodIndex: number, type: "top" | "bottom") => {
    if (readonly) return;
    
    const newPositions = [...beadPositions];
    
    if (type === "top") {
      newPositions[rodIndex] = { ...newPositions[rodIndex], top: false };
    } else {
      const currentBottom = newPositions[rodIndex].bottom;
      newPositions[rodIndex] = { ...newPositions[rodIndex], bottom: Math.max(currentBottom - 1, 0) };
    }
    
    setBeadPositions(newPositions);
    const newValue = beadPositionsToValue(newPositions);
    onChange?.(newValue);
  };

  const calculatedValue = beadPositionsToValue(beadPositions);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {label && (
        <div className="text-lg font-bold text-foreground bg-card px-6 py-2 rounded-full shadow-md">
          {label}
        </div>
      )}

      {/* Drag source area */}
      {!readonly && (
        <div className="bg-card rounded-3xl shadow-xl p-6 w-full max-w-2xl">
          <div className="text-center mb-4">
            <p className="text-base md:text-lg font-semibold text-muted-foreground mb-4">
              Drag beads from here to the rods
            </p>
            <div className="flex justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, "top")}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">5-Bead</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, "bottom")}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">1-Bead</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative bg-[hsl(var(--abacus-board))] rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-2xl">
        {/* Decorative top bead */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary shadow-lg" />
        </div>

        {/* Abacus rods */}
        <div className="grid grid-cols-5 gap-2 md:gap-4 mb-6">
          {PLACE_VALUES.map((place, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Rod container */}
              <div className="relative flex flex-col items-center w-full">
                {/* Vertical rod */}
                <div className="absolute w-1 md:w-2 h-48 md:h-64 bg-[hsl(var(--abacus-rod))] rounded-full top-0" />
                
                {/* Top section (5-value bead) - Drop zone */}
                <div
                  onDragOver={(e) => handleDragOver(e, index, "top")}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index, "top")}
                  className={cn(
                    "relative z-10 h-16 md:h-20 flex items-start justify-center pt-2 w-full",
                    dragOverIndex?.rod === index && dragOverIndex?.type === "top" && "bg-primary/10 rounded-lg"
                  )}
                >
                  {beadPositions[index].top && (
                    <div
                      onClick={() => handleRemoveBead(index, "top")}
                      className={cn(
                        "w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 translate-y-8 md:translate-y-12",
                        BEAD_COLORS[index],
                        !readonly && "cursor-pointer hover:brightness-110"
                      )}
                    />
                  )}
                </div>

                {/* Bottom section (1-value beads) - Drop zone */}
                <div
                  onDragOver={(e) => handleDragOver(e, index, "bottom")}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index, "bottom")}
                  className={cn(
                    "relative z-10 h-32 md:h-44 flex flex-col items-center justify-start gap-1 pt-2 w-full",
                    dragOverIndex?.rod === index && dragOverIndex?.type === "bottom" && "bg-primary/10 rounded-lg"
                  )}
                >
                  {[0, 1, 2, 3].map((beadIndex) => (
                    beadIndex < beadPositions[index].bottom && (
                      <div
                        key={beadIndex}
                        onClick={() => handleRemoveBead(index, "bottom")}
                        className={cn(
                          "w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                          BEAD_COLORS[index],
                          !readonly && "cursor-pointer hover:brightness-110"
                        )}
                      />
                    )
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
