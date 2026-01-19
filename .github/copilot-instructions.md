# React Native Date Time Spinner - Copilot Instructions

## Project Overview

A lightweight, pure JavaScript React Native library providing spinner-style date and time pickers. No native linking required. Built as a monorepo with the library in `src/` and Expo example app in `examples/example-expo/`.

## React Native Performance

When reviewing or writing React Native code, apply the optimization guidelines from:

-   ~/.github/agent-skills/skills/react-native-best-practices/SKILL.md (main reference)
-   ~/.github/agent-skills/skills/react-native-best-practices/references/ (detailed skills)

Key patterns:

-   Use FlashList over FlatList for large lists
-   Avoid barrel exports
-   Profile before optimizing

## Architecture

### Component Hierarchy

-   **`DateTimeSpinner`** (entry point): Orchestrates date/datetime picking with configurable columns

    -   Wraps multiple **`DurationScroll`** instances (one per column: day, month, year, hour, minute)
    -   Manages state synchronization between columns (e.g., adjusting days when month changes)
    -   Handles min/max date constraints and value clamping

-   **`DurationScroll`**: Low-level FlatList-based scrollable picker column
    -   Implements infinite scrolling via `repeatNumbersNTimes` prop (repeats item array N times)
    -   Calculates scroll offsets and snaps to items based on `interval` and `padWithNItems`
    -   Location: `src/components/DurationScroll/`

### Key Architectural Patterns

1. **Forwarded refs**: Both components expose imperative handles (`setValue`, `reset`, `latestValue`) via `forwardRef`/`useImperativeHandle`
2. **Utility functions are pure**: All `src/utils/` functions are stateless helpers (e.g., `generateNumbers.ts`, `getInitialScrollIndex.ts`)
3. **Styles are generated functions**: `generateStyles()` in `styles.ts` merges custom styles with defaults at render time
4. **Optional gradient overlays**: Components accept `LinearGradient` and `MaskedView` props (not bundled) for fade effects

## Development Workflow

### Setup & Running

```bash
yarn setup              # Install all dependencies (root + workspaces)
yarn start              # Start Expo dev server (example-expo)
yarn android/ios        # Run on device (from example-expo workspace)
yarn build              # Build library with react-native-builder-bob
```

### Testing

```bash
yarn test               # Run Jest tests (silent mode, force exit)
yarn ts                 # TypeScript type checking (no emit)
yarn lint:fix           # Auto-fix ESLint issues
```

-   Tests live in `src/tests/` with mocks in `src/tests/__mocks__/`
-   Test file naming: matches source file name (e.g., `DurationScroll.test.tsx`)
-   Use `@testing-library/react-native` for component tests

### Build System

-   **react-native-builder-bob** generates 3 outputs: `commonjs`, `module`, `typescript` (see `package.json` config)
-   Entry points: `main`, `module`, `types` fields point to `dist/` (generated on `yarn prepare`)
-   Source lives in `src/`, excluded: `src/tests`, `examples/`

## Code Conventions

### Component Props Pattern

```tsx
// Always destructure props with defaults at top of component
const {
    allowFontScaling = false,
    padWithNItems = 2,
    onDateChange,
    // ... rest
} = props;
```

### TypeScript Patterns

-   Export types from component index files: `export { ComponentProps, ComponentRef } from "./Component"`
-   Ref types: `ComponentRef` interface with imperative methods
-   Props types: `ComponentProps` interface
-   Value types: `ComponentValue` type (e.g., `DateTimeSpinnerValue` with `date`, `day`, `month`, etc.)

### Styling

-   Use `CustomDateTimeSpinnerStyles` type for style props (subset of React Native styles)
-   Theme support via `theme?: "light" | "dark"` style prop
-   Always merge custom styles with defaults: `...customStyles?.pickerItem`

### Date Handling

-   Internal state uses separate `day`, `month`, `year`, `hour`, `minute` numbers
-   Constraining logic in `getSafeInitialDateValue.ts` handles invalid dates (e.g., Feb 31 → Feb 28)
-   Min/max dates are swapped if provided in wrong order (see `DateTimeSpinner.tsx` line ~95)
-   Normalize dates to midnight when comparing date-only values

### Accessibility

-   All picker columns have `accessibilityRole="adjustable"` for VoiceOver/TalkBack support
-   Each column gets descriptive labels: "Day", "Month", "Year", "Hour", "Minute", "Date"
-   Users can override labels via `accessibilityLabels` prop for internationalization
-   Container uses auto-generated label: "Date picker" or "Date and time picker"
-   Time separator marked as `accessible={false}` to avoid screen reader confusion

## File Organization

```
src/
├── index.ts                          # Public API exports
├── components/
│   ├── DateTimeSpinner/
│   │   ├── DateTimeSpinner.tsx      # Main component (~1200 lines)
│   │   ├── types.ts                 # Props, Ref, Value types
│   │   ├── styles.ts                # generateStyles() function
│   │   └── index.ts                 # Component exports
│   └── DurationScroll/              # Reusable scroll column
└── utils/                            # Pure functions only
```

## Common Tasks

### Adding a new prop to DateTimeSpinner

1. Add to `DateTimeSpinnerProps` in `types.ts`
2. Destructure with default in component
3. Pass through to `DurationScroll` if needed
4. Update README.md Props table
5. Add example to `examples/example-expo/App.tsx`

### Modifying date constraint logic

-   Edit `src/utils/getSafeInitialDateValue.ts` (handles clamping/validation)
-   Update tests in `src/tests/getSafeInitialDateValue.test.ts`
-   Date parts are clamped independently then validated together

### Debugging scroll behavior

-   Check `getInitialScrollIndex.ts` for initial positioning math
-   Check `getDurationAndIndexFromScrollOffset.ts` for scroll-to-value conversion
-   Verify `repeatNumbersNTimes` calculation in `DurationScroll.tsx` line ~75 (dynamic repeat logic)

## Dependencies

-   **Peer deps**: React >=18.2, React Native >=0.72
-   **Optional**: `expo-linear-gradient` or `react-native-linear-gradient` for gradients
-   **Dev**: Jest, Testing Library, react-native-builder-bob
-   **Example app**: Uses `date-fns` for formatting, Expo 54+

## Key Gotchas

-   Infinite scroll requires `repeatNumbersNTimes >= 2` (enforced in `DurationScroll.tsx`)
-   Single-item pickers force `repeatNumbersNTimes = 1` to avoid empty lists
-   `formatDateToParts` overrides individual `padDayWithZero`/`padMonthWithZero` props
-   `dateTimeOrder` only applies in `mode="datetime"` (ignored in `mode="date"`)
