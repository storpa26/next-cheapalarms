# Pull Request

## Description
<!-- Describe your changes -->

## Design System Checklist

Before submitting, ensure all items are checked:

### ✅ Design Tokens
- [ ] All colors use design system tokens (no hardcoded hex values)
- [ ] All spacing uses design system scale (0-24, no arbitrary values)
- [ ] All shadows use design system tokens
- [ ] All motion uses design system tokens
- [ ] Typography uses design system tokens

### ✅ Components
- [ ] Uses UI primitives from `@/components/ui/` where possible
- [ ] Uses layout primitives (Container, Stack, Grid, Spacer, Divider) for layout
- [ ] Uses pattern components (PageHeader, StatCard, etc.) for common patterns
- [ ] No duplicate components created (check existing components first)

### ✅ Code Quality
- [ ] No ESLint errors
- [ ] No hardcoded values (colors, spacing, shadows)
- [ ] No arbitrary Tailwind classes (e.g., `w-[123px]`, `rounded-[8px]`)
- [ ] Components are accessible (ARIA attributes, keyboard navigation)
- [ ] Responsive design tested

### ✅ Documentation
- [ ] New components added to UI Library (`/ui-library`)
- [ ] JSDoc comments added to new components
- [ ] README updated if adding new tokens/components

### ✅ Testing
- [ ] Tested in development mode
- [ ] Tested responsive design (mobile, tablet, desktop)
- [ ] Tested accessibility (keyboard navigation, screen reader)
- [ ] Visual regression checked

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Design system update
- [ ] Component addition
- [ ] Documentation
- [ ] Refactoring

## Screenshots
<!-- Add screenshots if UI changes -->

## Related Issues
<!-- Link related issues -->

## Additional Notes
<!-- Any additional information -->

