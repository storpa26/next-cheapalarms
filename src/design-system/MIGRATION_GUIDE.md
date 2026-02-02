# Design System Migration Guide

This guide helps you migrate existing components to use the design system.

## 🎯 Migration Strategy

### Phase 1: New Components
- All new components use design system from day one
- No migration needed

### Phase 2: High-Traffic Components
- Migrate customer-facing components first
- Portal components
- Admin dashboard components

### Phase 3: Remaining Components
- Migrate remaining components gradually
- Use compatibility layer during transition

## 🔄 Step-by-Step Migration

### 1. Replace Hardcoded Colors

**Before:**
```jsx
<div className="bg-[#c95375] text-white">
  Content
</div>
```

**After:**
```jsx
<div className="bg-primary text-primary-foreground">
  Content
</div>
```

**Common Replacements:**
- `#c95375` → `bg-primary` / `text-primary`
- `#288896` → `bg-secondary` / `text-secondary`
- `#1EA6DF` → `bg-info` / `text-info`
- White/Black → `bg-surface` / `text-foreground`

### 2. Replace Arbitrary Spacing

**Before:**
```jsx
<div className="p-[12px] gap-[8px] m-[16px]">
  Content
</div>
```

**After:**
```jsx
<div className="p-3 gap-2 m-4">
  Content
</div>
```

**Spacing Scale:**
- `4px` → `1` (p-1, m-1, gap-1)
- `8px` → `2` (p-2, m-2, gap-2)
- `12px` → `3` (p-3, m-3, gap-3)
- `16px` → `4` (p-4, m-4, gap-4)
- `20px` → `5` (p-5, m-5, gap-5)
- `24px` → `6` (p-6, m-6, gap-6)
- `32px` → `8` (p-8, m-8, gap-8)
- `48px` → `12` (p-12, m-12, gap-12)

### 3. Replace Custom Shadows

**Before:**
```jsx
<div className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
  Content
</div>
```

**After:**
```jsx
<div className="shadow-card">
  Content
</div>
```

**Shadow Tokens:**
- `shadow-sm` - Small shadow
- `shadow-md` - Medium shadow
- `shadow-lg` - Large shadow
- `shadow-card` - Card shadow
- `shadow-elevated` - Elevated surfaces (modals)

### 4. Replace Border Radius

**Before:**
```jsx
<div className="rounded-[8px]">
  Content
</div>
```

**After:**
```jsx
<div className="rounded-lg">
  Content
</div>
```

**Radius Tokens:**
- `rounded-sm` - 4px
- `rounded-md` - 8px
- `rounded-lg` - 12px
- `rounded-xl` - 16px
- `rounded-2xl` - 24px

### 5. Use Layout Primitives

**Before:**
```jsx
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**After:**
```jsx
import { Stack } from '@/components/ui/stack';

<Stack gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>
```

**Before:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

**After:**
```jsx
import { Grid } from '@/components/ui/grid';

<Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
  {/* Items */}
</Grid>
```

### 6. Replace Inline Styles

**Before:**
```jsx
<div style={{ backgroundColor: '#c95375', color: '#fff', padding: '12px' }}>
  Content
</div>
```

**After:**
```jsx
<div className="bg-primary text-primary-foreground p-3">
  Content
</div>
```

## 📋 Migration Checklist

For each component:

- [ ] Replace hardcoded hex colors with design tokens
- [ ] Replace arbitrary spacing with design system scale
- [ ] Replace custom shadows with design tokens
- [ ] Replace arbitrary border radius with design tokens
- [ ] Replace inline styles with Tailwind classes
- [ ] Use layout primitives where applicable
- [ ] Use pattern components where applicable
- [ ] Test responsive design
- [ ] Test accessibility
- [ ] Update component documentation

## 🔍 Finding Violations

### Search for Hardcoded Colors
```bash
# Search for hex colors
grep -r "#[0-9a-fA-F]\{3,6\}" src/

# Search for arbitrary Tailwind values
grep -r "\[#[0-9a-fA-F]\{3,6\}\]" src/
```

### Search for Arbitrary Spacing
```bash
# Search for arbitrary pixel values
grep -r "\[[0-9]\+px\]" src/
```

### Search for Inline Styles
```bash
# Search for inline color styles
grep -r "style.*color.*#" src/
grep -r "style.*backgroundColor.*#" src/
```

## 🛠️ Tools

### ESLint
Run ESLint to find design system violations:
```bash
npm run lint
```

## 💡 Tips

1. **Start Small**: Migrate one component at a time
2. **Test Thoroughly**: Visual regression test after each migration
3. **Use Compatibility Layer**: Old code continues to work during migration
4. **Ask for Help**: Check README or ask team if unsure

## 🚨 Common Pitfalls

### Don't Mix Old and New
```jsx
// ❌ Bad - mixing old and new
<div className="bg-primary p-[12px]">
```

```jsx
// ✅ Good - all design system
<div className="bg-primary p-3">
```

### Don't Create Duplicate Components
```jsx
// ❌ Bad - creating duplicate
function MyButton() { return <button className="bg-[#c95375]">Click</button> }
```

```jsx
// ✅ Good - use existing component
import { Button } from '@/components/ui/button';
<Button>Click</Button>
```

### Don't Bypass for "Quick Fixes"
```jsx
// ❌ Bad - bypassing design system
<div className="bg-[#c95375] text-white">Quick fix</div>
```

```jsx
// ✅ Good - using design system
<div className="bg-primary text-primary-foreground">Proper fix</div>
```

## 📚 Resources

- **Design System README**: `src/design-system/README.md`
- **Token Reference**: `src/design-system/tokens/`
- **Theme CSS**: `src/design-system/theme/light.css`

---

**Need Help?** Check the README or ask the team!

