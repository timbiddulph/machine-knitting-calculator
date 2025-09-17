import { useState, useMemo } from 'react';
import { Calculator, Info, Copy } from 'lucide-react';
import { OperationType, DistributionType, CalculationType } from './types';
import { MagicFormulaCalculator } from './calculators/MagicFormulaCalculator';
import { CrewNeckCalculator } from './calculators/CrewNeckCalculator';


// Main App Component
export default function App() {
  const [stitches, setStitches] = useState<number>(50);
  const [rows, setRows] = useState<number>(120);
  const [operation, setOperation] = useState<OperationType>('decrease');
  const [distribution, setDistribution] = useState<DistributionType>('late_extra');
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [calculationType, setCalculationType] = useState<CalculationType>('straight');
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
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
                  <>

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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
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