# Machine Knitting Calculator - Claude Project Context

This file provides complete context for continuing development of the Machine Knitting Calculator project using Claude Code. It captures all domain knowledge, technical decisions, and implementation details discovered during initial development.

## Project Overview

**Name**: Machine Knitting Calculator  
**Purpose**: Professional stitch distribution calculator using Japanese notation for flatbed domestic and industrial manual knitting machines  
**Tech Stack**: React + TypeScript + Tailwind CSS + Vite  
**Deployment**: GitHub Pages with automated CI/CD  

## Domain Knowledge - Machine Knitting Fundamentals

### Critical Machine Knitting Constraints
1. **EOR (Every Other Row) Principle**: Decreases happen every other row due to carriage mechanics
2. **Yarn Position Constraint**: You can only decrease 1 stitch per side when yarn is on same side as decrease
3. **Cast-off vs Gradual**: Large reductions use immediate cast-off, small reductions use gradual EOR decreases
4. **Plain Row Buffer**: Always reserve at least 1 row at the end for plain knitting after shaping completes
5. **Bidirectional Understanding**: Machine knitters understand that instructions apply to both sides automatically

### Japanese Notation System
- **Format**: `±stitches/frequency/repetitions`
- **Examples**: 
  - `-1/2/50` = Decrease 1 stitch every 2 rows, 50 times
  - `-4/2/10, -5/2/2` = Decrease 4 stitches every 2 rows 10 times, then 5 stitches every 2 rows 2 times
- **Why Japanese**: Industry standard for machine knitting, precise and mathematical
- **Machine Compatibility**: Works across all flatbed domestic and industrial manual machines

## Core Algorithm - Magic Formula

### Mathematical Foundation
```
Given: S stitches to decrease over R rows
Available shaping rows: A = R - 1 (reserve 1 plain row)
Available decrease points: D = floor(A / 2) (EOR constraint)

Magic Formula application:
a = S (stitches to distribute)
b = D (available decrease points)  
c = floor(b / a) (base frequency in 2-row units)
d = b % a (remainder decrease points)
e = a - d (decreases at base frequency)
f = c + 1 (extended frequency)

Output segments:
- If e > 0: 1 stitch every (c * 2) rows, e times
- If d > 0: 1 stitch every (f * 2) rows, d times
```

### Key Algorithm Insights
1. **Row Distribution**: Algorithm distributes stitches across available EOR decrease points
2. **Frequency Calculation**: Multiply by 2 to convert from decrease points to actual row frequency
3. **Validation**: Total rows used must not exceed available shaping rows
4. **Edge Cases**: Handle cases where more rows available than needed (spreading out decreases)

## Technical Implementation Details

### Critical Bug Fixes Applied
1. **Variable Scoping**: Fixed `decreasePoints` undefined error by consistent naming
2. **Row Overflow**: Prevented calculations exceeding available shaping rows  
3. **Distribution Logic**: Corrected Magic Formula application for proper stitch distribution
4. **Warning Thresholds**: Adjusted warning logic to be realistic for machine knitting (8+ stitches per point)

### Distribution Methods
- **Standard (late_extra)**: Smaller decreases first, gradual curve start - DEFAULT
- **Early Extra**: Larger decreases first, aggressive curve start
- **Even Distribution**: REMOVED - too complex for manual machine operation

### Validation Rules
```typescript
// Input validation
stitches > 0 && rows > 0

// Machine constraints  
availableRowsForShaping = rows - 1 (reserve plain row)
availableDecreasePoints = floor(availableRowsForShaping / 2)

// Warnings
if (maxStitchesPerPoint > 8) warn("Very large decreases per point")
if (availableDecreasePoints === 0) warn("Need at least 2 rows")
if (totalRowsUsed > availableRowsForShaping) error("Exceeds available rows")
```

## User Interface Design Decisions

### Input Panel
- **Operation Toggle**: Decrease/Increase (currently only decrease implemented)
- **Numeric Inputs**: Large, touch-friendly with min/max validation
- **Distribution Selector**: Dropdown with clear descriptions
- **Real-time Calculation**: Immediate feedback on input changes

### Results Panel  
- **Japanese Notation**: Primary output in large, copyable format
- **Written Instructions**: Toggle-able detailed breakdown
- **Summary Statistics**: Shows shaping rows, plain rows, total rows
- **Warning System**: Contextual warnings with specific guidance

### Design Principles
- **Mobile-First**: Touch-friendly controls, thumb-zone optimization
- **Professional**: Clean, uncluttered interface for working environment
- **Accessible**: High contrast, large text, screen reader compatible
- **Knitter-Focused**: Industry terminology, familiar workflow patterns

## Project Architecture

### File Structure
```
src/
├── App.tsx                 # Main calculator component (single file currently)
├── main.tsx               # React entry point
├── index.css              # Tailwind imports
└── types/
    └── index.ts           # TypeScript interfaces

docs/
├── PRD.md                 # Product Requirements Document
├── RESEARCH.md            # Algorithm research and analysis
└── API.md                 # Future API documentation

.github/workflows/
└── deploy.yml             # Automated GitHub Pages deployment
```

### Current Implementation Status
- ✅ **Core Calculator**: Magic Formula algorithm working correctly
- ✅ **Japanese Notation**: Proper format output
- ✅ **EOR Logic**: Every-other-row constraint implemented
- ✅ **UI Components**: Complete input/results panels
- ✅ **Validation**: Real-time feedback and warnings
- ✅ **Deployment**: Automated GitHub Pages pipeline
- ❌ **Increase Operations**: Only decrease implemented (increase is identical algorithm)
- ❌ **Advanced Shaping**: Neckline/armhole/sleeve cap curves (Phase 2)
- ❌ **Pattern Export**: PDF/image export functionality (Phase 3)

## Development Workflow

### Local Development
```bash
npm install    # Install dependencies
npm run dev    # Start development server (localhost:5173)
npm run build  # Build for production
npm run preview # Preview production build
```

### Deployment
- **Automatic**: Push to main branch triggers GitHub Actions
- **Manual**: Run deployment script for complete setup
- **Live URL**: `https://username.github.io/machine-knitting-calculator`

## Future Development Roadmap

### Phase 2: Advanced Shaping
- **Neckline Curves**: U-shaped, V-shaped with Bézier curve mathematics
- **Armhole Shaping**: Industry-standard armhole depth calculations
- **Sleeve Cap**: Composite curve algorithms for set-in sleeves
- **Custom Curves**: User-defined curve parameters

### Phase 3: Professional Features  
- **Pattern Export**: PDF generation with visual charts
- **Batch Calculations**: Multiple shaping calculations in one session
- **Pattern Templates**: Pre-built templates for common garment pieces
- **Gauge Integration**: Stitch/row gauge considerations for visualization

### Phase 4: Advanced Tools
- **Visual Charting**: Grid-based stitch charts with color coding
- **Pattern Validation**: Check for knitting feasibility
- **Multi-format Output**: Support additional notation systems
- **API Development**: RESTful API for integration with other tools

## Testing Strategy

### Unit Testing Focus
- **Magic Formula**: Test algorithm with various input combinations
- **Edge Cases**: Very small/large stitch counts, unusual row counts
- **Validation Logic**: Ensure warnings trigger at correct thresholds
- **Output Formatting**: Verify Japanese notation correctness

### Integration Testing
- **UI Workflow**: Complete user input-to-output flow
- **Real-time Updates**: State changes and re-calculations
- **Copy Functionality**: Clipboard integration
- **Mobile Experience**: Touch interactions and responsive layout

### User Acceptance Testing
- **Professional Knitters**: Validate against real-world use cases
- **Cross-browser**: Chrome, Firefox, Safari, Edge compatibility
- **Accessibility**: Screen reader and keyboard navigation
- **Performance**: Load time and calculation speed

## Common Issues and Solutions

### Issue: "decreasePoints is not defined"
**Solution**: Ensure consistent variable naming throughout component. Use `availableDecreasePoints` consistently.

### Issue: Calculations exceed available rows
**Solution**: Apply Magic Formula correctly - distribute stitches across decrease points, not the reverse.

### Issue: Warnings showing for normal shaping
**Solution**: Adjust warning thresholds to be realistic for machine knitting (8+ stitches per point).

### Issue: Plain row not reserved
**Solution**: Always calculate `availableRowsForShaping = rows - 1` to reserve final row.

## Machine Knitting Industry Context

### Target Users
- **Home Knitters**: Domestic flatbed machine owners (Brother, Singer, etc.)
- **Professional Knitters**: Industrial machine operators
- **Pattern Designers**: Creating commercial knitting patterns
- **Educators**: Teaching machine knitting techniques

### Market Gap Addressed
- **Current Tools**: Expensive desktop software (DesignaKnit $500+), limited web tools
- **Our Solution**: Free, web-based, mobile-optimized, professional-grade calculations
- **Competitive Advantage**: Focus on Japanese notation and machine knitting constraints

### Industry Standards Compliance
- **Japanese Notation**: Industry-standard format used globally
- **Magic Formula**: Established textile industry algorithm
- **EOR Logic**: Fundamental machine knitting constraint
- **Professional Terminology**: Uses correct industry language

## Key Learnings from Development

### Domain-Specific Requirements
1. **Machine constraints are paramount** - Can't ignore physical limitations
2. **Japanese notation is essential** - Universal machine knitting language  
3. **EOR logic is fundamental** - Every-other-row is not optional
4. **Plain row buffer is critical** - Always need finishing space

### Algorithm Insights
1. **Magic Formula versatility** - Works for various distribution needs
2. **Frequency conversion importance** - Must convert decrease points to row frequency
3. **Edge case handling** - More rows than stitches requires special handling
4. **Validation complexity** - Machine knitting has many edge cases

### UI/UX Discoveries
1. **Professional aesthetic matters** - Knitters want clean, serious tools
2. **Copy functionality essential** - Must easily transfer results to patterns
3. **Real-time feedback expected** - Immediate validation and warnings
4. **Mobile optimization critical** - Many knitters use tablets/phones

### Technical Architecture
1. **Single component works well** - For this scope, complexity not needed
2. **TypeScript validation valuable** - Catches calculation errors early  
3. **Tailwind speeds development** - Rapid UI iteration without custom CSS
4. **GitHub Actions reliable** - Automated deployment works seamlessly

## Next Development Session Goals

When continuing with Claude Code, focus on:

1. **Immediate Priorities**:
   - Implement increase operations (copy decrease logic, flip signs)
   - Add input validation improvements
   - Enhance mobile responsiveness

2. **Phase 2 Preparation**:
   - Refactor into modular components
   - Create calculation engine as separate module
   - Design curve calculation interface

3. **Code Quality**:
   - Add comprehensive TypeScript types
   - Implement error boundaries
   - Add unit tests for core calculations

4. **User Experience**:
   - Add keyboard shortcuts
   - Improve accessibility
   - Add calculation history feature

## Resources and References

### Machine Knitting Resources
- **Magic Formula**: Sister Mountain blog - shaping calculations
- **Japanese Notation**: Machine knitting forums and documentation
- **Industry Standards**: Craft Yarn Council abbreviations
- **Technical Papers**: ACM research on knitting algorithms

### Algorithm References  
- **Magic Formula Mathematics**: Textile industry standard algorithm
- **Bézier Curves**: For future curve shaping implementation
- **Discrete Distribution**: Mathematical foundations for stitch placement

### Development Resources
- **React + TypeScript**: Official documentation and best practices
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Modern build tool for React applications
- **GitHub Actions**: CI/CD pipeline documentation

---

**This document provides complete context for continuing development. All domain knowledge, technical decisions, and implementation details are captured to enable seamless project continuation in Claude Code.**