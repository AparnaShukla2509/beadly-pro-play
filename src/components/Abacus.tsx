import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BeadPosition {
  top: boolean;
  bottom: number;
}

interface AbacusProps {
  value?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  label?: string;
  showValue?: boolean;
}

const PLACE_VALUES = [
  { name: "Hundreds", value: 100, label: "(100)" },
  { name: "Tens", value: 10, label: "(10)" },
  { name: "Ones", value: 1, label: "(1)" },
  { name: "Tenths", value: 0.1, label: "(0.1)" },
  { name: "Hundredths", value: 0.01, label: "(0.01)" },
];

const BEAD_COLORS = [
  "bg-[hsl(var(--bead-1))]",
  "bg-[hsl(var(--bead-2))]",
  "bg-[hsl(var(--bead-3))]",
  "bg-[hsl(var(--bead-4))]",
  "bg-[hsl(var(--bead-5))]",
];

export const Abacus = ({ value = 0, onChange, readonly = false, label, showValue = true }: AbacusProps) => {
  const [beadPositions, setBeadPositions] = useState<BeadPosition[]>([
    { top: false, bottom: 0 },
    { top: false, bottom: 0 },
    { top: false, bottom: 0 },
    { top: false, bottom: 0 },
    { top: false, bottom: 0 },
  ]);

  useEffect(() => {
    const positions = valueToBeadPositions(value);
    setBeadPositions(positions);
  }, [value]);

  const valueToBeadPositions = (val: number): BeadPosition[] => {
    const positions: BeadPosition[] = [];
    let remaining = Math.round(val * 100) / 100;

    PLACE_VALUES.forEach((place) => {
      const count = Math.floor(remaining / place.value);
      const effectiveCount = Math.min(count, place.value === 100 || place.value === 10 || place.value === 1 ? 9 : 9);
      
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

  const toggleTopBead = (index: number) => {
    if (readonly) return;
    
    const newPositions = [...beadPositions];
    newPositions[index] = { ...newPositions[index], top: !newPositions[index].top };
    setBeadPositions(newPositions);
    
    const newValue = beadPositionsToValue(newPositions);
    onChange?.(newValue);
  };

  const incrementBottomBeads = (index: number) => {
    if (readonly) return;
    
    const newPositions = [...beadPositions];
    const currentBottom = newPositions[index].bottom;
    newPositions[index] = { ...newPositions[index], bottom: Math.min(currentBottom + 1, 4) };
    setBeadPositions(newPositions);
    
    const newValue = beadPositionsToValue(newPositions);
    onChange?.(newValue);
  };

  const decrementBottomBeads = (index: number) => {
    if (readonly) return;
    
    const newPositions = [...beadPositions];
    const currentBottom = newPositions[index].bottom;
    newPositions[index] = { ...newPositions[index], bottom: Math.max(currentBottom - 1, 0) };
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
                
                {/* Top section (5-value bead) */}
                <div className="relative z-10 h-16 md:h-20 flex items-start justify-center pt-2">
                  <button
                    onClick={() => toggleTopBead(index)}
                    disabled={readonly}
                    className={cn(
                      "w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                      BEAD_COLORS[index],
                      beadPositions[index].top ? "translate-y-8 md:translate-y-12" : "translate-y-0",
                      !readonly && "cursor-pointer hover:brightness-110",
                      readonly && "cursor-default opacity-80"
                    )}
                    aria-label={`Toggle ${place.name} top bead`}
                  />
                </div>

                {/* Divider line */}
                <div className="w-full h-1 bg-[hsl(var(--abacus-rod))] rounded-full my-2 z-20" />

                {/* Bottom section (1-value beads) */}
                <div className="relative z-10 h-32 md:h-44 flex flex-col items-center justify-start gap-1 pt-2">
                  {[0, 1, 2, 3].map((beadIndex) => (
                    <button
                      key={beadIndex}
                      onClick={() => {
                        if (beadIndex < beadPositions[index].bottom) {
                          decrementBottomBeads(index);
                        } else if (beadIndex === beadPositions[index].bottom) {
                          incrementBottomBeads(index);
                        }
                      }}
                      disabled={readonly}
                      className={cn(
                        "w-8 h-8 md:w-12 md:h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95",
                        BEAD_COLORS[index],
                        beadIndex < beadPositions[index].bottom
                          ? "translate-y-0 opacity-100"
                          : "translate-y-0 opacity-30",
                        !readonly && "cursor-pointer hover:brightness-110",
                        readonly && "cursor-default"
                      )}
                      aria-label={`${place.name} bead ${beadIndex + 1}`}
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
