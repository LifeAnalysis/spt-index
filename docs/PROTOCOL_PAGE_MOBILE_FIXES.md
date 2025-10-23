# Protocol Detail Page - Critical Mobile Issues

## Current Problems

### 1. Protocol Header (Lines 249-340)
**Issue:** Metrics are in a single horizontal flex row causing horizontal scrolling
```tsx
// Line 289: This causes horizontal scroll on mobile
<div className="flex items-center gap-3 text-caption">
```

**Fix Needed:**
- Use responsive padding: `px-4 sm:px-6 lg:px-8` instead of `px-8`
- Use grid on mobile, flex on desktop for metrics
- Reduce gaps on mobile

### 2. Performance Overview (Lines 347-398)
**Issue:** Score and changes are in single row, doesn't adapt to mobile

**Fix Needed:**
- Stack vertically on mobile
- Use grid for changes on mobile

### 3. Chart Controls (Lines 406-445)
**Issue:** All buttons in single row, too cramped on mobile

**Fix Needed:**
- Stack momentum toggle above time range buttons on mobile
- Use full width buttons on mobile

## Quick Fixes Applied

See the updated file for mobile-responsive classes.

