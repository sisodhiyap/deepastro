# DeepAstro Answer Card Engine

## 1. Design System & Aesthetics
- **Background**: Dark cosmic gradient (`#0a101f` to `#050814`) with subtle starlight nebulae.
- **Accents**: Cyan (`#22d3ee`), Violet (`#a855f7`), Amber/Gold (`#f59e0b`).
- **Aspect Ratio**: 4:5 optimized for mobile viewing and social sharing.
- **Typography**: Precision geometric typography with clear hierarchy (Header, Summary, Signals, Favourable Window, Tip, Actions, Footers).

## 2. Card Specification Schema
- `id`: Unique snapshot identifier.
- `version`: Version tag (`6.0.4`).
- `question`: User query verbatim.
- `primaryHeader`: Domain-specific title (e.g. 'Career Outlook', 'Market Intelligence', 'Meteorological Weather').
- `summaryText`: Verified synthesis text.
- `momentumScore`: Optional mathematical momentum indicator with explicit computation formula. Zero fake percentages allowed.
- `keySignals`: List of indicators tagged with status (`growth`, `caution`, `milestone`, `neutral`).
- `favourableWindow`: Actionable timing window.
- `deepAstroTip`: Actionable philosophical or tactical takeaway.
- `suggestedActions`: Actionable checklists for user progression.
- `visualImageUrl`: Contextual question-specific artwork.
- `sourcesFooter`: Source citations, timestamp in IST, and scientific/astrological disclaimers.

## 3. Export Formats
- **PNG**: High-fidelity raster export.
- **WebP**: Compressed modern web export.
- **PDF**: Document archival export.
