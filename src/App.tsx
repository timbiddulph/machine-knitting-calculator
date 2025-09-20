import { useState, useMemo } from 'react';
import { Calculator, Info, Copy, HelpCircle } from 'lucide-react';
import { OperationType, DistributionType, CalculationType, MeasurementUnit, GaugeSettings, MeasurementInputs } from './types';
import { MagicFormulaCalculator } from './calculators/MagicFormulaCalculator';
import { CrewNeckCalculator } from './calculators/CrewNeckCalculator';


// Main App Component
export default function App() {
  const [operation, setOperation] = useState<OperationType>('decrease');
  const [distribution, setDistribution] = useState<DistributionType>('late_extra');
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [calculationType, setCalculationType] = useState<CalculationType>('straight');

  // Gauge and measurement states (persistent across calculation types)
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>('cm');
  const [gauge, setGauge] = useState<GaugeSettings>({
    stitchesPerCm: 2.5,
    rowsPerCm: 3.5
  });
  const [measurements, setMeasurements] = useState<MeasurementInputs>({
    widthChange: 10,
    heightAvailable: 20
  });
  const [neckMeasurement, setNeckMeasurement] = useState<number>(8);

  // Convert measurements to stitches/rows
  const convertedStitches = useMemo(() => {
    const unitMultiplier = measurementUnit === 'inches' ? 2.54 : 1; // Convert inches to cm
    const cmValue = measurements.widthChange * unitMultiplier;
    return Math.round(cmValue * gauge.stitchesPerCm);
  }, [measurements.widthChange, measurementUnit, gauge.stitchesPerCm]);

  const convertedRows = useMemo(() => {
    const unitMultiplier = measurementUnit === 'inches' ? 2.54 : 1; // Convert inches to cm
    const cmValue = measurements.heightAvailable * unitMultiplier;
    return Math.round(cmValue * gauge.rowsPerCm);
  }, [measurements.heightAvailable, measurementUnit, gauge.rowsPerCm]);

  const convertedNeckStitches = useMemo(() => {
    const unitMultiplier = measurementUnit === 'inches' ? 2.54 : 1; // Convert inches to cm
    const cmValue = neckMeasurement * unitMultiplier;
    return Math.round(cmValue * gauge.stitchesPerCm);
  }, [neckMeasurement, measurementUnit, gauge.stitchesPerCm]);

  // Calculate results using converted values
  const result = useMemo(() => {
    return MagicFormulaCalculator.calculate(convertedStitches, convertedRows, distribution, operation);
  }, [convertedStitches, convertedRows, distribution, operation]);

  // Calculate crew neck results
  const crewNeckResult = useMemo(() => {
    return CrewNeckCalculator.calculate(convertedNeckStitches);
  }, [convertedNeckStitches]);


  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Tooltip component
  const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          className="cursor-help"
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-full ml-2 w-64">
            {content}
            <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        )}
      </div>
    );
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
              {/* Gauge Settings - Always visible and persistent */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-medium text-gray-800">Gauge</h3>
                    <Tooltip content="Your knitting gauge - measure by knitting a swatch and counting stitches and rows per unit. This is crucial for accurate calculations.">
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <label htmlFor="stitchesPerCm" className="block text-sm font-medium text-gray-700">
                        Stitches per {measurementUnit === 'cm' ? 'cm' : 'inch'}
                      </label>
                      <Tooltip content="Count the number of stitches across 1cm (or 1 inch) in your gauge swatch. Use the same yarn and needle size as your project.">
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
                    <input
                      type="number"
                      id="stitchesPerCm"
                      value={measurementUnit === 'cm' ? gauge.stitchesPerCm : (gauge.stitchesPerCm * 2.54).toFixed(1)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const cmValue = measurementUnit === 'cm' ? value : value / 2.54;
                        setGauge(prev => ({ ...prev, stitchesPerCm: cmValue }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <label htmlFor="rowsPerCm" className="block text-sm font-medium text-gray-700">
                        Rows per {measurementUnit === 'cm' ? 'cm' : 'inch'}
                      </label>
                      <Tooltip content="Count the number of rows across 1cm (or 1 inch) vertically in your gauge swatch. Include both knit and purl rows in your count.">
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
                    <input
                      type="number"
                      id="rowsPerCm"
                      value={measurementUnit === 'cm' ? gauge.rowsPerCm : (gauge.rowsPerCm * 2.54).toFixed(1)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        const cmValue = measurementUnit === 'cm' ? value : value / 2.54;
                        setGauge(prev => ({ ...prev, rowsPerCm: cmValue }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Calculation Inputs</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Calculation Type
                        </label>
                        <Tooltip content="Straight Line: Even decreases across a specified height. Crew Neck: Curved neckline shaping with cast-off and gradual decreases.">
                          <HelpCircle className="w-3 h-3 text-gray-400" />
                        </Tooltip>
                      </div>
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
                    <div className="flex items-center gap-1 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Operation Type
                      </label>
                      <Tooltip content="Decrease: Remove stitches to make fabric narrower. Increase: Add stitches to make fabric wider. Both use the same calculation logic.">
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
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
                      <div className="flex items-center gap-1 mb-2">
                        <label htmlFor="widthChange" className="block text-sm font-medium text-gray-700">
                          Width to {operation} ({measurementUnit})
                        </label>
                        <Tooltip content="The actual measurement to decrease or increase. For waist shaping, this might be 5-10cm. For sleeve tapering, could be 15-20cm.">
                          <HelpCircle className="w-3 h-3 text-gray-400" />
                        </Tooltip>
                      </div>
                      <input
                        type="number"
                        id="widthChange"
                        value={measurements.widthChange}
                        onChange={(e) => setMeasurements(prev => ({
                          ...prev,
                          widthChange: Math.max(0.1, parseFloat(e.target.value) || 0.1)
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                        min="0.1"
                        step="0.1"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Converts to {convertedStitches} stitches
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <label htmlFor="heightAvailable" className="block text-sm font-medium text-gray-700">
                          Height available ({measurementUnit})
                        </label>
                        <Tooltip content="The vertical distance you have to complete the shaping. For waist-to-bust, typically 15-20cm. For sleeve length, measure from underarm to wrist.">
                          <HelpCircle className="w-3 h-3 text-gray-400" />
                        </Tooltip>
                      </div>
                      <input
                        type="number"
                        id="heightAvailable"
                        value={measurements.heightAvailable}
                        onChange={(e) => setMeasurements(prev => ({
                          ...prev,
                          heightAvailable: Math.max(0.1, parseFloat(e.target.value) || 0.1)
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                        min="0.1"
                        step="0.1"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Converts to {convertedRows} rows
                      </p>
                    </div>

                  </>
                )}

                {calculationType === 'straight' && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Distribution Method
                      </label>
                      <Tooltip content="Aggressive start: Larger decreases first, then smaller ones. Gentle start: Smaller decreases first, then larger ones. Choose based on desired shaping curve.">
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
                    <select
                      value={distribution}
                      onChange={(e) => setDistribution(e.target.value as any)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="late_extra">Aggressive start</option>
                      <option value="early_extra">Gentle start</option>
                    </select>
                  </div>
                )}

                {calculationType === 'crew_neck' && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <label htmlFor="neckMeasurement" className="block text-sm font-medium text-gray-700">
                        Total width to decrease ({measurementUnit})
                      </label>
                      <Tooltip content="The total width to be decreased for the neckline opening. For adults, typically 6-10cm depending on yarn weight and desired fit.">
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      </Tooltip>
                    </div>
                    <input
                      type="number"
                      id="neckMeasurement"
                      value={neckMeasurement}
                      onChange={(e) => setNeckMeasurement(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                      min="0.1"
                      step="0.1"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Converts to {convertedNeckStitches} stitches
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Calculations are per side. Uses 1/3 minimum cast-off rule: 1/3 cast off, remaining split between every row and EOR decreases.
                    </p>
                  </div>
                )}
                  </div>
                </div>

                {/* Unit Selection */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-1 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <Tooltip content="Choose your preferred measurement unit. All inputs and calculations will update automatically when you switch units.">
                      <HelpCircle className="w-3 h-3 text-gray-400" />
                    </Tooltip>
                  </div>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setMeasurementUnit('cm')}
                      className={`flex-1 px-4 py-2 rounded-md transition-all ${
                        measurementUnit === 'cm'
                          ? 'bg-white shadow text-indigo-600 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      onClick={() => setMeasurementUnit('inches')}
                      className={`flex-1 px-4 py-2 rounded-md transition-all ${
                        measurementUnit === 'inches'
                          ? 'bg-white shadow text-indigo-600 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      inches
                    </button>
                  </div>
                </div>
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
                      <div className="text-lg font-medium">{result.totalRowsUsed} / {Math.max(1, convertedRows - 1)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Plain Rows</div>
                      <div className="text-lg font-medium">{convertedRows - result.totalRowsUsed}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Rows</div>
                      <div className="text-lg font-medium">{convertedRows}</div>
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