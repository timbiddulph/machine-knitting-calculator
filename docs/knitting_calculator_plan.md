# Machine Knitting Calculator Web App - Software Plan

## Core Application Overview

**Purpose**: A web-based machine knitting calculator that converts stitch/row requirements into precise Japanese notation instructions for flatbed domestic and industrial manual machines.

**Primary Input**: "Decrease 50 stitches over 120 rows"  
**Primary Output**: Japanese notation format: `-20, -1/1/20, -1/2/5, -1/3/5`

---

## 1. Technical Architecture

### Frontend Framework
- **React** with TypeScript for type safety
- **Tailwind CSS** for responsive design
- **Framer Motion** for smooth animations
- **React Hook Form** for input validation

### State Management
- **Zustand** for lightweight global state
- Local component state for UI interactions

### Core Calculations
- **Client-side JavaScript** calculation engine
- **Web Workers** for complex curve calculations
- **Math.js** library for precision arithmetic

### Build & Deployment
- **Vite** for fast development and building
- **Vercel/Netlify** for static hosting
- **PWA capabilities** for offline use

---

## 2. User Interface Design

### Layout Structure
```
Header: Logo + Navigation
Main Calculator Area:
  ├── Input Panel (Left 40%)
  ├── Results Panel (Right 60%)
Footer: Settings + Help
```

### Input Panel Components
1. **Basic Inputs**
   - Stitches to change: `±50`
   - Over rows: `120`
   - Operation type: `Decrease/Increase` toggle

2. **Shaping Type Selector**
   - Straight Line (default)
   - Neckline Curve
   - Armhole Shaping  
   - Sleeve Cap Shaping

3. **Advanced Options** (collapsible)
   - Distribution method: Even/Early Extra/Late Extra
   - Starting row offset
   - Gauge information (for visualization)

### Results Panel Components
1. **Japanese Notation Output**
   ```
   Primary: -50/120 total
   Breakdown: -20, -1/1/20, -1/2/5, -1/3/5
   ```

2. **Written Instructions** (toggleable)
   ```
   Decrease 20 stitches immediately
   Decrease 1 stitch every 1 row, 20 times
   Decrease 1 stitch every 2 rows, 5 times
   Decrease 1 stitch every 3 rows, 5 times
   ```

3. **Visual Chart** (optional)
   - Grid showing row-by-row instructions
   - Color-coded decrease/increase points

---

## 3. Core Calculation Engine

### Magic Formula Implementation
```typescript
interface ShapingCalculation {
  totalStitches: number;
  totalRows: number;
  shapingType: 'even' | 'early_extra' | 'late_extra';
}

interface ShapingResult {
  immediate: number;
  segments: Array<{
    stitches: number;
    frequency: number;
    repetitions: number;
  }>;
  japaneseNotation: string;
}
```

### Algorithm Classes
1. **StraightLineShaper**
   - Even distribution (Magic Formula)
   - Early extra shaping
   - Late extra shaping

2. **CurveShaper**
   - U-shaped necklines (circular arc)
   - V-shaped necklines (geometric progression)
   - Custom Bézier curves

3. **ArmholeShaper**
   - Standard armhole calculations
   - Bind-off + gradual shaping

4. **SleeveCapShaper**
   - Composite curve algorithms
   - Industry-standard proportions

---

## 4. Feature Specifications

### Phase 1: Core Functionality
- [x] Magic Formula calculator
- [x] Japanese notation output
- [x] Straight line shaping (even/early/late)
- [x] Basic input validation
- [x] Responsive design

### Phase 2: Advanced Shaping
- [ ] Neckline curve calculations
- [ ] Armhole shaping presets
- [ ] Sleeve cap algorithms
- [ ] Visual chart generation

### Phase 3: Enhanced UX
- [ ] Calculation history
- [ ] Export to PDF/image
- [ ] Gauge-based visualization
- [ ] Keyboard shortcuts

### Phase 4: Professional Features
- [ ] Pattern template library
- [ ] Multiple notation formats
- [ ] Batch calculations
- [ ] API for external tools

---

## 5. Input Validation Rules

### Stitch Count Validation
- Range: 1-999 stitches
- Must be positive integer
- Warning if >200 (unusual but possible)

### Row Count Validation  
- Range: 1-9999 rows
- Must be positive integer
- Must be ≥ stitch count for practical shaping

### Ratio Validation
- Warn if ratio >1:1 (very aggressive shaping)
- Suggest alternatives for impossible ratios
- Calculate minimum rows needed

### Machine-Specific Constraints
- Gauge-based stitch limits
- Mechanical feasibility checks
- Yarn tension considerations

---

## 6. Japanese Notation System

### Format Standards
```
Immediate changes: ±N
Repeated changes: ±S/F/R
Where: S=stitches, F=frequency, R=repetitions
```

### Output Examples
```typescript
// Input: decrease 50 over 120 rows
output: "-20, -1/1/20, -1/2/5, -1/3/5"

// Input: increase 30 over 80 rows  
output: "+1/2/20, +1/3/10"

// Input: decrease 8 over 16 rows (even)
output: "-1/2/8"
```

### Validation Rules
- Verify total: Sum all changes = target
- Check math: (frequency × repetitions) = rows used
- Ensure remaining rows accommodate pattern

---

## 7. User Experience Flow

### Primary Workflow
1. **Input Phase**
   - Enter stitches and rows
   - Select shaping type
   - Choose distribution method

2. **Calculation Phase**  
   - Real-time validation
   - Algorithm selection
   - Result generation

3. **Output Phase**
   - Display Japanese notation
   - Show written instructions
   - Provide visual confirmation

4. **Action Phase**
   - Copy to clipboard
   - Export instructions  
   - Save to history

### Error Handling
- **Invalid inputs**: Red borders + specific messages
- **Impossible calculations**: Alternative suggestions
- **Edge cases**: Graceful degradation with warnings
- **Network issues**: Offline functionality maintained

---

## 8. Component Structure

```
App/
├── components/
│   ├── Calculator/
│   │   ├── InputPanel.tsx
│   │   ├── ResultsPanel.tsx
│   │   └── ShapingTypeSelector.tsx
│   ├── UI/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Toggle.tsx
│   └── Layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── calculations/
│   │   ├── MagicFormula.ts
│   │   ├── CurveShaper.ts
│   │   └── NotationFormatter.ts
│   └── utils/
│       ├── validation.ts
│       └── constants.ts
└── types/
    ├── calculations.ts
    └── ui.ts
```

---

## 9. Data Models

### Core Interfaces
```typescript
interface CalculationInput {
  stitches: number;
  rows: number;
  operation: 'increase' | 'decrease';
  shapingType: ShapingType;
  distribution: DistributionMethod;
  startRow?: number;
}

interface CalculationResult {
  japaneseNotation: string;
  writtenInstructions: string[];
  segments: ShapingSegment[];
  validation: ValidationResult;
  visualData?: ChartData;
}

interface ShapingSegment {
  stitches: number;
  frequency: number;
  repetitions: number;
  startRow: number;
  endRow: number;
}
```

---

## 10. Testing Strategy

### Unit Tests
- Magic Formula calculations
- Edge case handling
- Input validation
- Notation formatting

### Integration Tests  
- Calculator workflow
- UI component interactions
- Error state handling

### User Acceptance Tests
- Professional machine knitter validation
- Cross-browser compatibility
- Mobile device testing
- Accessibility compliance

---

## 11. Performance Considerations

### Optimization Targets
- **Initial load**: <2 seconds
- **Calculation response**: <100ms
- **Bundle size**: <500KB gzipped
- **Lighthouse score**: >90

### Implementation
- Code splitting by feature
- Memoized calculation results
- Optimized re-renders
- Web Worker for complex curves

---

## 12. Accessibility Features

### WCAG 2.1 AA Compliance
- 4.5:1 color contrast minimum
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Knitter-Specific Needs
- Large, readable text (16px minimum)
- Clear visual hierarchy
- Touch-friendly controls (44px minimum)
- Error messages with context

---

## 13. Mobile Optimization

### Responsive Breakpoints
- **Mobile**: 320-768px (single column)
- **Tablet**: 768-1024px (side-by-side)
- **Desktop**: 1024px+ (full layout)

### Touch Interactions
- Swipe between input/results
- Long-press for additional options
- Pinch-zoom for visual charts
- Thumb-zone button placement

---

## 14. Future Extensibility

### API Design
- RESTful endpoints for calculations
- Webhook support for integrations
- Rate limiting and authentication
- OpenAPI documentation

### Plugin Architecture  
- Custom shaping algorithms
- Third-party notation formats
- Machine-specific optimizations
- Pattern template system

---

## Development Timeline

**Week 1-2**: Core architecture + Magic Formula  
**Week 3-4**: Basic UI + Japanese notation  
**Week 5-6**: Advanced shaping algorithms  
**Week 7-8**: Visual charts + mobile optimization  
**Week 9-10**: Testing + refinement  
**Week 11-12**: Deployment + documentation

---

This plan provides a solid foundation for building a professional-grade machine knitting calculator that addresses the market gap identified in our research while leveraging established industry standards and mathematical algorithms.