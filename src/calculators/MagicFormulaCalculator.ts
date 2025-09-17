import { ShapingResult, ShapingSegment, OperationType, DistributionType } from '../types';

export class MagicFormulaCalculator {
  static calculate(stitches: number, rows: number, distribution: DistributionType, operation: OperationType): ShapingResult {
    // Input validation
    if (stitches <= 0 || rows <= 0) {
      return {
        castOff: 0,
        gradualSegments: [],
        japaneseNotation: '',
        writtenInstructions: ['Invalid input: stitches and rows must be positive'],
        totalRowsUsed: 0,
        isValid: false,
        warnings: []
      };
    }

    // Reserve at least 1 row at the end for plain knitting
    const availableRowsForShaping = Math.max(1, rows - 1);

    // Machine knitting: decreases happen every other row (EOR)
    const availableDecreasePoints = Math.floor(availableRowsForShaping / 2);

    // Apply Magic Formula to distribute stitches across available EOR points
    const segments: ShapingSegment[] = [];

    if (stitches > 0 && availableDecreasePoints > 0) {
      if (stitches > availableRowsForShaping && stitches > availableDecreasePoints) {
        // Special case: More stitches than both available rows AND decrease points
        // Use mixed approach: distribute stitches across decrease points with varying amounts
        const baseStitchesPerPoint = Math.floor(stitches / availableDecreasePoints);
        const extraStitches = stitches % availableDecreasePoints;

        // Some points get base amount, others get base + 1
        const pointsWithBase = availableDecreasePoints - extraStitches;

        // Aggressive start: larger decreases first, then smaller
        if (extraStitches > 0) {
          segments.push({
            stitches: baseStitchesPerPoint + 1,
            frequency: 2,
            repetitions: extraStitches
          });
        }

        if (baseStitchesPerPoint > 0 && pointsWithBase > 0) {
          segments.push({
            stitches: baseStitchesPerPoint,
            frequency: 2,
            repetitions: pointsWithBase
          });
        }

        // Apply distribution preference
        if (distribution === 'early_extra' && segments.length === 2) {
          // Gentle start: put smaller stitches first (gradual build-up)
          if (segments[0].stitches > segments[1].stitches) {
            [segments[0], segments[1]] = [segments[1], segments[0]];
          }
        }
        // Aggressive start (late_extra) keeps larger stitches first (default order)
      } else if (stitches < availableDecreasePoints) {
        // Standard case: fewer stitches than decrease points - use Magic Formula
        const a = stitches; // stitches to distribute
        const b = availableDecreasePoints; // available decrease points
        const c = Math.floor(b / a); // base frequency (in 2-row units)
        const d = b % a; // remainder decrease points
        const e = a - d; // decreases at base frequency
        const f = c + 1; // extended frequency

        // Create segments - frequency is in actual rows (multiply by 2)
        if (e > 0) {
          segments.push({
            stitches: 1,
            frequency: c * 2,
            repetitions: e
          });
        }

        if (d > 0) {
          segments.push({
            stitches: 1,
            frequency: f * 2,
            repetitions: d
          });
        }

        // Apply distribution preference
        if (distribution === 'early_extra' && segments.length === 2) {
          // Put larger frequency first (more spacing = later decreases)
          if (segments[0].frequency < segments[1].frequency) {
            [segments[0], segments[1]] = [segments[1], segments[0]];
          }
        }
      } else if (stitches === availableDecreasePoints) {
        // Exact match: 1 stitch per decrease point - use EOR
        segments.push({
          stitches: 1,
          frequency: 2,
          repetitions: stitches
        });
      } else {
        // More stitches than decrease points
        // Use every-row decreases for some, EOR for the rest to fit within available rows

        // We need to use some every-row decreases (which use 1 row each)
        // and some EOR decreases (which use 2 rows each)
        // Let x = every-row decreases, y = EOR decreases
        // x + y = stitches
        // x + 2y ≤ availableRowsForShaping
        // Solve for optimal distribution

        // Solve: x + y = stitches, x + 2y ≤ availableRowsForShaping
        // From first equation: x = stitches - y
        // Substituting: (stitches - y) + 2y ≤ availableRowsForShaping
        // So: stitches + y ≤ availableRowsForShaping
        // Therefore: y ≤ availableRowsForShaping - stitches
        const maxEorDecreses = availableRowsForShaping - stitches;
        const eorDecreses = Math.min(maxEorDecreses, stitches);
        const everyRowDecreses = stitches - eorDecreses;

        if (everyRowDecreses > 0) {
          segments.push({
            stitches: 1,
            frequency: 1,
            repetitions: everyRowDecreses
          });
        }

        if (maxEorDecreses > 0) {
          segments.push({
            stitches: 1,
            frequency: 2,
            repetitions: maxEorDecreses
          });
        }
      }
    }

    // Generate Japanese notation
    const operationSymbol = operation === 'increase' ? '' : '-';
    const notation = segments.map(seg =>
      `${operationSymbol}${seg.stitches}/${seg.frequency}/${seg.repetitions}`
    ).join(', ');

    // Generate written instructions
    const operationText = operation === 'increase' ? 'Increase' : 'Decrease';
    const instructions: string[] = [];
    segments.forEach(seg => {
      const stitchText = seg.stitches === 1 ? '1 stitch' : `${seg.stitches} stitches`;
      instructions.push(`${operationText} ${stitchText} every ${seg.frequency} rows, ${seg.repetitions} times`);
    });

    // Validation and warnings
    const totalRowsUsed = segments.reduce((sum, seg) => sum + (seg.frequency * seg.repetitions), 0);
    const warnings: string[] = [];

    if (stitches > availableRowsForShaping && stitches > availableDecreasePoints) {
      const maxStitchesPerPoint = Math.max(...segments.map(seg => seg.stitches));
      if (maxStitchesPerPoint > 8) {
        warnings.push(`Very large decreases required: up to ${maxStitchesPerPoint} stitches per decrease point`);
      }
    } else if (totalRowsUsed > availableRowsForShaping) {
      warnings.push('Shaping exceeds available rows - adjust parameters');
    }

    // Check for unrealistic decrease rates per point
    const maxStitchesPerPoint = Math.max(...segments.map(seg => seg.stitches), 0);
    if (maxStitchesPerPoint > 8) {
      warnings.push('Very large decreases per point - consider more rows for smoother curve');
    }

    if (availableDecreasePoints === 0) {
      warnings.push('Not enough rows for EOR decreases - need at least 2 rows');
    }

    if (rows < 2) {
      warnings.push('Need at least 2 rows total (1 for shaping + 1 plain row)');
    }

    return {
      castOff: 0,
      gradualSegments: segments,
      japaneseNotation: notation,
      writtenInstructions: instructions,
      totalRowsUsed,
      isValid: totalRowsUsed <= availableRowsForShaping && stitches > 0 && rows >= 2,
      warnings
    };
  }
}