# RTL (Right-to-Left) Implementation Guide

## Overview

ContraMind.ai now has full RTL support for Arabic language users. The implementation ensures that the entire application layout, text direction, and UI elements properly flip when the user switches to Arabic.

## Features Implemented

### 1. Automatic Direction Switching

The `<html>` element's `dir` attribute automatically changes based on the selected language:

```typescript
// In LanguageContext.tsx
useEffect(() => {
  document.documentElement.dir = direction; // "ltr" or "rtl"
  document.documentElement.lang = language; // "en" or "ar"
}, [direction, language]);
```

- **LTR (Left-to-Right)**: English interface
- **RTL (Right-to-Left)**: Arabic interface

### 2. Logical CSS Properties

All directional CSS has been converted to use logical properties that automatically adapt to text direction:

**Before (Directional):**
```css
.container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
```

**After (Logical):**
```css
.container {
  margin-inline: auto;
  padding-inline: 1rem;
}
```

### 3. Icon Mirroring

Directional icons (chevrons, arrows) automatically mirror in RTL mode:

```tsx
// Add the rtl-mirror class to directional icons
<ChevronRight className="rtl-mirror" />
<ArrowLeft className="rtl-mirror" />
```

The CSS handles the transformation:
```css
[dir="rtl"] .rtl-mirror {
  transform: scaleX(-1);
}
```

### 4. RTL-Aware Utilities

New utility classes for RTL-aware styling:

```css
/* Text alignment */
.text-start  /* Aligns to start (left in LTR, right in RTL) */
.text-end    /* Aligns to end (right in LTR, left in RTL) */

/* Spacing */
.ms-auto     /* margin-inline-start: auto */
.me-auto     /* margin-inline-end: auto */
.ps-2        /* padding-inline-start: 0.5rem */
.pe-2        /* padding-inline-end: 0.5rem */
```

### 5. React Hooks

Custom hooks for RTL-aware components:

```typescript
// Get RTL state and icon mirroring
import { useRTL } from "@/lib/rtl";

const { isRTL, direction, getMirrorClass } = useRTL();

// Usage
<ChevronRight className={getMirrorClass("ChevronRight")} />
```

```typescript
// Get directional classes
import { useDirectionalClass } from "@/lib/rtl";

const dir = useDirectionalClass();

// Returns "ml-4" in LTR, "mr-4" in RTL
<div className={dir("ml-4", "mr-4")}>
```

```typescript
// Get text alignment
import { useTextAlign } from "@/lib/rtl";

const align = useTextAlign();

// Returns "text-left" in LTR, "text-right" in RTL
<div className={align.start}>
```

## Testing

### Snapshot Tests

Three comprehensive snapshot tests verify RTL behavior:

1. **Dashboard Card RTL Test** - Verifies card layout direction
2. **Navigation Icons RTL Test** - Verifies icon mirroring
3. **Form RTL Test** - Verifies text alignment and input direction

Run tests:
```bash
pnpm test -- rtl.test.tsx
```

All tests pass with snapshots captured for both LTR and RTL modes.

### Manual Testing

Visit the RTL demo page to see all features in action:

```
http://localhost:3000/rtl-demo
```

The demo shows:
- Language switching (English ↔ Arabic)
- Icon mirroring demonstration
- Text alignment examples
- Layout direction changes
- Implementation code examples

## Usage Guidelines

### For Developers

1. **Always use logical properties in CSS:**
   - Use `margin-inline`, `padding-inline` instead of `margin-left/right`, `padding-left/right`
   - Use `text-start`, `text-end` instead of `text-left`, `text-right`
   - Use `border-inline-start` instead of `border-left`

2. **Mirror directional icons:**
   - Add `rtl-mirror` class to chevrons, arrows, and directional icons
   - Icons like `ChevronRight`, `ArrowLeft`, `ArrowRight` should be mirrored

3. **Use the translation system:**
   ```tsx
   const { t } = useLanguage();
   <h1>{t("dashboard.title")}</h1>
   ```

4. **Force LTR for specific content:**
   ```tsx
   // For code blocks, numbers, emails
   <code className="ltr-only">
     const x = 42;
   </code>
   ```

### Common Patterns

**Navigation with icons:**
```tsx
<Button className="gap-2">
  <ChevronLeft className="rtl-mirror" />
  {t("nav.back")}
</Button>
```

**Form labels:**
```tsx
<label className="text-start block">
  {t("form.name")}
</label>
```

**Flex layouts:**
```tsx
// Automatically reverses in RTL
<div className="flex gap-4">
  <div>First</div>
  <div>Second</div>
  <div>Third</div>
</div>
```

## Browser Support

RTL support works in all modern browsers:
- Chrome/Edge 89+
- Firefox 88+
- Safari 14.1+

Logical properties are well-supported across all major browsers.

## Accessibility

The implementation follows WCAG 2.1 guidelines:
- Proper `dir` and `lang` attributes on `<html>`
- Semantic HTML structure maintained
- Keyboard navigation works correctly in both directions
- Screen readers properly announce direction

## Future Improvements

Potential enhancements:
1. Add more Arabic translations for admin panel
2. Implement RTL-aware date/time formatting
3. Add RTL support for third-party components (charts, calendars)
4. Create visual regression tests for RTL layouts

## References

- [MDN: CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [W3C: Structural markup and right-to-left text](https://www.w3.org/International/questions/qa-html-dir)
- [Material Design: Bidirectionality](https://m2.material.io/design/usability/bidirectionality.html)

