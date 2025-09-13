import { useState, useMemo } from 'react';
import { Calculator, Info, Copy } from 'lucide-react';

// Types
interface ShapingSegment {
  stitches: number;
  frequency: number;
  repetitions: number;
}

interface ShapingResult {
  castOff: number;
  gradualSegments: ShapingSegment[];
  japaneseNotation: string;
  writtenInstructions: string[];
  totalRowsUsed: number;
  isValid: boolean;
  warnings: string[];
}

interface CrewNeckResult {
  castOff: number;
  everyRowDecrease: number;
  eorDecrease: number;
  japaneseNotation: string;
  writtenInstructions: string[];
  totalRowsUsed: number;
  isValid: boolean;
  warnings: string[];
}

// Crew neck calculation engine
class CrewNeckCalculator {
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

    // Per side calculations using your method
    const castOff = Math.floor(totalStitchesToDecrease / 4);
    const everyRowDecrease = Math.floor(totalStitchesToDecrease / 2);
    const eorDecrease = totalStitchesToDecrease - castOff - everyRowDecrease;

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
    if (castOff > 0) {
      instructions.push(`Cast off ${castOff} stitches at center`);
    }
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

// Core calculation engine
class MagicFormulaCalculator {
  static calculate(stitches: number, rows: number, distribution: 'early_extra' | 'late_extra', operation: 'decrease' | 'increase'): ShapingResult {
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

// Main App Component
export default function App() {
  const [stitches, setStitches] = useState<number>(50);
  const [rows, setRows] = useState<number>(120);
  const [operation, setOperation] = useState<'decrease' | 'increase'>('decrease');
  const [distribution, setDistribution] = useState<'early_extra' | 'late_extra'>('late_extra');
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [calculationType, setCalculationType] = useState<'straight' | 'crew_neck'>('straight');
  const [neckStitches, setNeckStitches] = useState<number>(20);

  // Calculate results
  const result = useMemo(() => {
    return MagicFormulaCalculator.calculate(stitches, rows, distribution, operation);
  }, [stitches, rows, distribution, operation]);

  // Calculate crew neck results
  const crewNeckResult = useMemo(() => {
    return CrewNeckCalculator.calculate(neckStitches);
  }, [neckStitches]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Machine Knitting Calculator</h1>
          </div>
          <p className="text-gray-600">Professional stitch distribution using Japanese notation</p>
        </header>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Calculation Inputs</h2>
              
              {/* Basic Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculation Type
                  </label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setCalculationType('straight')}
                      className={`flex-1 px-4 py-2 rounded-md transition-all ${
                        calculationType === 'straight'
                          ? 'bg-white shadow text-indigo-600 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      Straight Line
                    </button>
                    <button
                      onClick={() => setCalculationType('crew_neck')}
                      className={`flex-1 px-4 py-2 rounded-md transition-all ${
                        calculationType === 'crew_neck'
                          ? 'bg-white shadow text-indigo-600 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      Crew Neck
                    </button>
                  </div>
                </div>

                {calculationType === 'straight' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operation Type
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setOperation('decrease')}
                        className={`flex-1 px-4 py-2 rounded-md transition-all ${
                          operation === 'decrease'
                            ? 'bg-white shadow text-indigo-600 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        Decrease
                      </button>
                      <button
                        onClick={() => setOperation('increase')}
                        className={`flex-1 px-4 py-2 rounded-md transition-all ${
                          operation === 'increase'
                            ? 'bg-white shadow text-indigo-600 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        Increase
                      </button>
                    </div>
                  </div>
                )}

                {calculationType === 'straight' && (
                  <>
                    <div>
                      <label htmlFor="stitches" className="block text-sm font-medium text-gray-700 mb-2">
                        Stitches to {operation}
                      </label>
                      <input
                        type="number"
                        id="stitches"
                        value={stitches}
                        onChange={(e) => setStitches(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                        min="1"
                        max="999"
                      />
                    </div>

                    <div>
                      <label htmlFor="rows" className="block text-sm font-medium text-gray-700 mb-2">
                        Over rows
                      </label>
                      <input
                        type="number"
                        id="rows"
                        value={rows}
                        onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                        min="1"
                        max="9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Distribution Method
                      </label>
                      <select
                        value={distribution}
                        onChange={(e) => setDistribution(e.target.value as any)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="late_extra">Aggressive start</option>
                        <option value="early_extra">Gentle start</option>
                      </select>
                    </div>
                  </>
                )}

                {calculationType === 'crew_neck' && (
                  <div>
                    <label htmlFor="neckStitches" className="block text-sm font-medium text-gray-700 mb-2">
                      Total stitches to decrease
                    </label>
                    <input
                      type="number"
                      id="neckStitches"
                      value={neckStitches}
                      onChange={(e) => setNeckStitches(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                      min="1"
                      max="999"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Calculations are per side. Uses your method: 1/4 cast off, 1/2 every row, remainder EOR.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Results</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {showInstructions ? 'Hide' : 'Show'} Instructions
                  </button>
                </div>
              </div>

{calculationType === 'straight' && result.isValid ? (
                <div className="space-y-6">
                  {/* Japanese Notation */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-800">Japanese Notation</h3>
                      <button
                        onClick={() => copyToClipboard(result.japaneseNotation)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <code className="text-xl font-mono text-gray-800">{result.japaneseNotation}</code>
                    </div>
                  </div>

                  {/* Written Instructions */}
                  {showInstructions && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Written Instructions</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ol className="space-y-1">
                          {result.writtenInstructions.map((instruction, index) => (
                            <li key={index} className="text-gray-700">
                              {index + 1}. {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-500">Shaping Rows</div>
                      <div className="text-lg font-medium">{result.totalRowsUsed} / {Math.max(1, rows - 1)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Plain Rows</div>
                      <div className="text-lg font-medium">{rows - result.totalRowsUsed}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Rows</div>
                      <div className="text-lg font-medium">{rows}</div>
                    </div>
                  </div>
                </div>
              ) : calculationType === 'crew_neck' && crewNeckResult.isValid ? (
                <div className="space-y-6">
                  {/* Japanese Notation */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-800">Japanese Notation (per side)</h3>
                      <button
                        onClick={() => copyToClipboard(crewNeckResult.japaneseNotation)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <code className="text-xl font-mono text-gray-800">{crewNeckResult.japaneseNotation}</code>
                    </div>
                  </div>

                  {/* Written Instructions */}
                  {showInstructions && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Written Instructions</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-1">
                          {crewNeckResult.writtenInstructions.map((instruction, index) => (
                            <li key={index} className="text-gray-700">
                              • {instruction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-gray-500">Cast Off</div>
                      <div className="text-lg font-medium">{crewNeckResult.castOff} stitches</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Every Row</div>
                      <div className="text-lg font-medium">{crewNeckResult.everyRowDecrease} times</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">EOR</div>
                      <div className="text-lg font-medium">{crewNeckResult.eorDecrease} times</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Enter valid parameters to see calculations
                </div>
              )}

              {/* Warnings */}
              {((calculationType === 'straight' && result.warnings.length > 0) ||
                (calculationType === 'crew_neck' && crewNeckResult.warnings.length > 0)) && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 mb-1">Warnings</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        {(calculationType === 'straight' ? result.warnings : crewNeckResult.warnings).map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600">
          <p>Designed for flatbed domestic and industrial manual knitting machines</p>
        </footer>
      </div>
    </div>
  );
}