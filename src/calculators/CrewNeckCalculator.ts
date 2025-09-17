import { CrewNeckResult } from '../types';

export class CrewNeckCalculator {
  static calculate(totalStitchesToDecrease: number): CrewNeckResult {
    // Input validation
    if (totalStitchesToDecrease <= 0) {
      return {
        castOff: 0,
        everyRowDecrease: 0,
        eorDecrease: 0,
        japaneseNotation: '',
        writtenInstructions: ['Invalid input: stitches must be positive'],
        totalRowsUsed: 0,
        isValid: false,
        warnings: []
      };
    }

    // Per side calculations using 1/3 minimum cast-off rule
    const castOff = Math.floor(totalStitchesToDecrease / 3);
    const remainingStitches = totalStitchesToDecrease - castOff;
    const everyRowDecrease = Math.floor(remainingStitches / 2);
    const eorDecrease = remainingStitches - everyRowDecrease;

    // Calculate total rows used
    const totalRowsUsed = everyRowDecrease + (eorDecrease * 2);

    // Generate Japanese notation (per side)
    const notationParts: string[] = [];
    if (castOff > 0) {
      notationParts.push(`-${castOff}`);
    }
    if (everyRowDecrease > 0) {
      notationParts.push(`-1/1/${everyRowDecrease}`);
    }
    if (eorDecrease > 0) {
      notationParts.push(`-1/2/${eorDecrease}`);
    }
    const japaneseNotation = notationParts.join(', ');

    // Generate written instructions
    const instructions: string[] = [];
    instructions.push(`Per side calculations for ${totalStitchesToDecrease} total stitches:`);
    instructions.push(`Cast off: ${castOff} stitches (minimum 1/3 of total)`);
    if (everyRowDecrease > 0) {
      instructions.push(`Decrease 1 stitch every row, ${everyRowDecrease} times`);
    }
    if (eorDecrease > 0) {
      instructions.push(`Decrease 1 stitch every other row, ${eorDecrease} times`);
    }
    instructions.push(`Total rows for neck shaping: approximately ${totalRowsUsed}`);

    // Warnings
    const warnings: string[] = [];
    if (totalStitchesToDecrease < 8) {
      warnings.push('Very small neck opening - consider more stitches for adult garment');
    }
    if (eorDecrease === 0) {
      warnings.push('No EOR decreases - curve may be too steep');
    }

    return {
      castOff,
      everyRowDecrease,
      eorDecrease,
      japaneseNotation,
      writtenInstructions: instructions,
      totalRowsUsed,
      isValid: true,
      warnings
    };
  }
}