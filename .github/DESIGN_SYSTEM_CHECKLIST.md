# Design System PR Checklist

Use this checklist for all PRs that touch UI components or styling.

## 🎨 Design Tokens

### Colors
- [ ] No hardcoded hex colors (e.g., `#c95375`, `#288896`)
- [ ] Uses semantic tokens: `bg-primary`, `text-foreground`, `border-border`
- [ ] Uses brand colors: `bg-primary`, `bg-secondary`
- [ ] Uses semantic colors: `bg-success`, `bg-error`, `bg-warning`, `bg-info`

### Spacing
- [ ] No arbitrary spacing values (e.g., `p-[12px]`, `gap-[8px]`)
- [ ] Uses design system scale: `p-0` through `p-24` (4px increments)
- [ ] Uses layout primitives: `Stack`, `Grid`, `Spacer` for complex layouts

### Typography
- [ ] Uses design system font sizes: `text-xs`, `text-sm`, `text-base`, etc.
- [ ] Uses design system font weights: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- [ ] No custom font sizes or weights

### Shadows
- [ ] Uses design system shadows: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-card`, `shadow-elevated`
- [ ] No custom shadow values

### Border Radius
- [ ] Uses design system radius: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`
- [ ] No arbitrary radius values (e.g., `rounded-[8px]`)

## 🧩 Components

### UI Primitives
- [ ] Uses existing UI components from `@/components/ui/` where possible
- [ ] No duplicate components created
- [ ] New components follow design system patterns

### Layout Primitives
- [ ] Uses `Container` for page-level containers
- [ ] Uses `Stack` for vertical/horizontal layouts
- [ ] Uses `Grid` for responsive grids
- [ ] Uses `Spacer` for consistent spacing
- [ ] Uses `Divider` for separators

### Pattern Components
- [ ] Uses `PageHeader` for page titles
- [ ] Uses `SectionHeader` for section titles
- [ ] Uses `StatCard` for metrics
- [ ] Uses `EmptyState`, `LoadingState`, `ErrorState` for states
- [ ] Uses `DataToolbar` for search/filter toolbars

## 🔍 Code Quality

### ESLint
- [ ] No ESLint errors or warnings
- [ ] Design system rules pass

### Accessibility
- [ ] Semantic HTML used
- [ ] ARIA attributes included where needed
- [ ] Keyboard navigation works
- [ ] Focus states visible

### Responsive Design
- [ ] Tested on mobile (320px+)
- [ ] Tested on tablet (768px+)
- [ ] Tested on desktop (1024px+)
- [ ] Uses responsive utilities correctly

## 📚 Documentation

### New Components
- [ ] Added to UI Library (`/ui-library`)
- [ ] JSDoc comments added
- [ ] Usage examples provided

### New Tokens
- [ ] Added to `primitives.ts` or `semantic.ts`
- [ ] CSS variable added to `light.css`
- [ ] Mapped in `tailwind.config.js`
- [ ] Documented in README

## 🧪 Testing

- [ ] Tested in development mode
- [ ] Visual regression checked
- [ ] Accessibility tested
- [ ] Responsive design verified

## 🚫 Common Mistakes to Avoid

- ❌ Hardcoded colors: `bg-[#c95375]` → ✅ `bg-primary`
- ❌ Arbitrary spacing: `p-[12px]` → ✅ `p-3`
- ❌ Custom shadows: `shadow-[0_4px_6px_rgba(0,0,0,0.1)]` → ✅ `shadow-card`
- ❌ Arbitrary radius: `rounded-[8px]` → ✅ `rounded-lg`
- ❌ Inline styles for colors: `style={{ color: '#c95375' }}` → ✅ `className="text-primary"`
- ❌ Duplicate components → ✅ Use existing components
- ❌ Bypassing design system → ✅ Use design tokens

## 📝 Notes

<!-- Add any additional notes or exceptions -->

