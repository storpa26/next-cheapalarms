# CheapAlarms Design System

A comprehensive, token-based design system for consistent UI across the CheapAlarms platform.

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Design Tokens](#design-tokens)
- [Components](#components)
- [Usage Guidelines](#usage-guidelines)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

## 🎯 Overview

The CheapAlarms Design System provides:

- **Consistent Design Language**: Unified colors, spacing, typography, and motion
- **Reusable Components**: Pre-built UI primitives and patterns
- **Type Safety**: TypeScript support with JSDoc
- **Accessibility**: WCAG-compliant components
- **Theme Ready**: Built for light/dark mode (dark mode coming soon)

## 🏗️ Architecture

### Token Hierarchy

```
Primitive Tokens (raw values)
    ↓
Semantic Tokens (meaning-based)
    ↓
Component Tokens (component-specific)
```

### File Structure

```
src/design-system/
├── tokens/
│   ├── primitives.ts      # Raw atomic values
│   ├── semantic.ts         # Reference/documentation only
│   └── index.ts           # Exports
├── theme/
│   ├── light.css          # Source of truth (CSS variables)
│   └── index.css          # Theme imports
└── README.md              # This file

src/components/ui/         # UI primitives
src/components/patterns/   # Pattern components (future)
```

## 🎨 Design Tokens

### Primitive Tokens

Raw, atomic values with no semantic meaning:

- **Colors**: Pink, Teal, Gray scales
- **Spacing**: 0-24 (4px increments)
- **Radius**: none, sm, md, lg, xl, 2xl, 3xl, full
- **Shadows**: none, sm, md, lg, xl, 2xl, card, elevated, inner
- **Motion**: fast (150ms), normal (250ms), slow (350ms) + easing functions
- **Typography**: Font families, sizes, weights

**Location**: `src/design-system/tokens/primitives.ts`

### Semantic Tokens

Meaning-based tokens that reference primitives:

- **Backgrounds**: `bg`, `surface`, `muted`, `elevated`
- **Text**: `text`, `text-muted`, `text-disabled`, `text-inverse`
- **Borders**: `border`, `border-strong`, `border-subtle`
- **Brand**: `primary`, `secondary` (with hover/active states)
- **Semantic**: `success`, `error`, `warning`, `info` (with foregrounds and backgrounds)
- **State**: `state-hover-bg`, `state-active-bg`, `opacity-disabled`
- **Focus/Ring**: `ring`, `ring-offset`, `focus`

**Source of Truth**: `src/design-system/theme/light.css` (CSS variables)
**Reference**: `src/design-system/tokens/semantic.ts` (documentation only)

### Using Tokens

**In Tailwind Classes:**
```jsx
<div className="bg-primary text-primary-foreground">
  Content
</div>
```

**In CSS:**
```css
.custom-class {
  background-color: hsl(var(--color-primary));
  color: hsl(var(--color-primary-foreground));
}
```

**In Inline Styles:**
```jsx
<div style={{ backgroundColor: 'hsl(var(--color-primary))' }}>
  Content
</div>
```

## 🧩 Components

### UI Primitives

Located in `src/components/ui/`:

- **Button**: Multiple variants (default, secondary, outline, ghost, destructive, link)
- **Input**: Text input with focus states
- **Card**: Container with header, content, footer
- **Badge**: Status indicators with variants
- **Alert**: Notifications (default, success, error, warning, info)
- **Progress**: Progress bars
- **Spinner**: Loading indicators
- **Skeleton**: Loading placeholders
- **Tabs**: Tab navigation
- **Table**: Data tables
- **Dialog**: Modal dialogs

### Layout Primitives

- **Container**: Responsive container with max-width
- **Stack**: Vertical/horizontal stack with gap
- **Grid**: Responsive grid layout
- **Spacer**: Vertical/horizontal spacing
- **Divider**: Horizontal/vertical dividers

### Pattern Components

Located in `src/components/ui/`:

- **PageHeader**: Page titles with actions
- **SectionHeader**: Section titles
- **StatCard**: Statistics/metrics display
- **EmptyState**: Empty data states
- **LoadingState**: Loading indicators
- **ErrorState**: Error displays
- **DataToolbar**: Search, filter, and action toolbar

## 📖 Usage Guidelines

### ✅ DO

- Use design system tokens for all colors, spacing, and typography
- Use UI primitives from `@/components/ui/`
- Use layout primitives for consistent spacing
- Use pattern components for common layouts
- Follow the token hierarchy (semantic > primitive)
- Use Tailwind classes mapped to design tokens

### ❌ DON'T

- Don't use hardcoded hex colors (e.g., `#c95375`)
- Don't use arbitrary Tailwind values (e.g., `w-[123px]`, `rounded-[8px]`)
- Don't use inline styles for colors/spacing (use tokens)
- Don't create new components without checking existing ones
- Don't bypass the design system for "quick fixes"

### Component Usage Examples

**Button:**
```jsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="secondary" size="sm">Small</Button>
```

**Layout:**
```jsx
import { Container } from '@/components/ui/container';
import { Stack } from '@/components/ui/stack';
import { Grid } from '@/components/ui/grid';

<Container>
  <Stack gap={4}>
    <h1>Title</h1>
    <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
      {/* Items */}
    </Grid>
  </Stack>
</Container>
```

**Pattern:**
```jsx
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

<PageHeader
  title="Dashboard"
  description="Overview"
  actions={<Button>Action</Button>}
/>
```

## 🔄 Migration Guide

### Migrating Existing Components

1. **Replace hardcoded colors:**
   ```jsx
   // Before
   <div className="bg-[#c95375] text-white">
   
   // After
   <div className="bg-primary text-primary-foreground">
   ```

2. **Replace arbitrary spacing:**
   ```jsx
   // Before
   <div className="p-[12px] gap-[8px]">
   
   // After
   <div className="p-3 gap-2">
   ```

3. **Replace custom shadows:**
   ```jsx
   // Before
   <div className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
   
   // After
   <div className="shadow-card">
   ```

4. **Use layout primitives:**
   ```jsx
   // Before
   <div className="flex flex-col gap-4">
   
   // After
   <Stack gap={4}>
   ```

### Compatibility Layer

The design system includes a compatibility layer in `globals.css` that maps old variables to new ones. This allows gradual migration without breaking existing code.

## ✨ Best Practices

### 1. Token Usage

- Always prefer semantic tokens over primitives
- Use CSS variables via Tailwind classes
- Don't hardcode HSL values

### 2. Component Composition

- Compose complex UIs from primitives
- Use pattern components for common layouts
- Keep components focused and reusable

### 3. Responsive Design

- Use layout primitives (Grid, Stack) for responsive layouts
- Use Tailwind responsive prefixes when needed
- Test on multiple screen sizes

### 4. Accessibility

- Use semantic HTML
- Include ARIA attributes where needed
- Ensure keyboard navigation works
- Test with screen readers

### 5. Performance

- Use design system components (they're optimized)
- Avoid creating duplicate components
- Use layout primitives for consistent spacing

## 📝 Contributing

### Adding New Components

1. Create component in `src/components/ui/`
2. Use design system tokens
3. Add JSDoc comments
4. Update this README

### Adding New Tokens

1. Add to `primitives.ts` if primitive
2. Add to `semantic.ts` for reference
3. Add CSS variable to `light.css` (source of truth)
4. Map in `tailwind.config.js`
5. Document in this README

## 🔍 Enforcement

### ESLint Rules

ESLint rules enforce design system usage:
- Prevents hardcoded hex colors
- Prevents arbitrary Tailwind values
- Ensures design token usage

### PR Checklist

Before submitting a PR, ensure:
- [ ] All colors use design tokens
- [ ] All spacing uses design system scale
- [ ] Components use UI primitives where possible
- [ ] No hardcoded values (hex, arbitrary px)
- [ ] Accessibility attributes included
- [ ] Responsive design tested
## 📚 Resources

- **Token Reference**: `src/design-system/tokens/`
- **Theme CSS**: `src/design-system/theme/light.css`
- **Tailwind Config**: `tailwind.config.js`

## 🚀 Quick Start

```jsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stack } from '@/components/ui/stack';

export default function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Stack gap={4}>
          <h2 className="text-2xl font-bold">Title</h2>
          <Button>Action</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
```

---

**Last Updated**: Phase 6 Complete
**Version**: 1.0.0

