// Core shaping types for machine knitting calculations

export interface ShapingSegment {
  stitches: number;
  frequency: number;
  repetitions: number;
}

export interface ShapingResult {
  castOff: number;
  gradualSegments: ShapingSegment[];
  japaneseNotation: string;
  writtenInstructions: string[];
  totalRowsUsed: number;
  isValid: boolean;
  warnings: string[];
}

export interface CrewNeckResult {
  castOff: number;
  everyRowDecrease: number;
  eorDecrease: number;
  japaneseNotation: string;
  writtenInstructions: string[];
  totalRowsUsed: number;
  isValid: boolean;
  warnings: string[];
}

export type OperationType = 'decrease' | 'increase';
export type DistributionType = 'early_extra' | 'late_extra';
export type CalculationType = 'straight' | 'crew_neck';