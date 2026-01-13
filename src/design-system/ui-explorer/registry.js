/**
 * UI Explorer Registry
 * Single source of truth for all explorer items
 */

// Foundations
import ColorsDemo from './sections/foundations/Colors.demo';
import TypographyDemo from './sections/foundations/Typography.demo';
import SpacingDemo from './sections/foundations/Spacing.demo';
import RadiiDemo from './sections/foundations/Radii.demo';
import ShadowsDemo from './sections/foundations/Shadows.demo';
import MotionDemo from './sections/foundations/Motion.demo';

// Layout
import LayoutDemo from './sections/layout/Layout.demo';

// Components
import ButtonDemo from './sections/components/Button.demo';
import InputDemo from './sections/components/Input.demo';
import TextareaDemo from './sections/components/Textarea.demo';
import SelectDemo from './sections/components/Select.demo';
import CheckboxDemo from './sections/components/Checkbox.demo';
import RadioDemo from './sections/components/Radio.demo';
import SwitchDemo from './sections/components/Switch.demo';
import CardDemo from './sections/components/Card.demo';
import BadgeDemo from './sections/components/Badge.demo';
import AlertDemo from './sections/components/Alert.demo';
import TabsDemo from './sections/components/Tabs.demo';
import TableDemo from './sections/components/Table.demo';
import ProgressDemo from './sections/components/Progress.demo';
import SpinnerDemo from './sections/components/Spinner.demo';
import SkeletonDemo from './sections/components/Skeleton.demo';
import DialogDemo from './sections/components/Dialog.demo';
import ToastDemo from './sections/components/Toast.demo';
import DatePickerDemo from './sections/components/DatePicker.demo';
import TimePickerDemo from './sections/components/TimePicker.demo';

// Patterns
import PageHeaderDemo from './sections/patterns/PageHeader.demo';
import SectionHeaderDemo from './sections/patterns/SectionHeader.demo';
import StatCardDemo from './sections/patterns/StatCard.demo';
import EmptyStateDemo from './sections/patterns/EmptyState.demo';
import LoadingStateDemo from './sections/patterns/LoadingState.demo';
import ErrorStateDemo from './sections/patterns/ErrorState.demo';
import DataToolbarDemo from './sections/patterns/DataToolbar.demo';
import SidebarDemo from './sections/patterns/Sidebar.demo';

// Compositions
import EstimatesListDemo from './sections/compositions/EstimatesList.demo';
import PhotoUploadDemo from './sections/compositions/PhotoUpload.demo';
import DashboardOverviewDemo from './sections/compositions/DashboardOverview.demo';
import BookingDemo from './sections/compositions/Booking.demo';

export const registry = [
  // Foundations
  {
    id: 'foundations-colors',
    group: 'Foundations',
    title: 'Colors',
    description: 'Design system color tokens including brand, semantic, and surface colors. All colors use HSL values stored in CSS variables.',
    DemoComponent: ColorsDemo,
    code: `// Using semantic color tokens
<div className="bg-primary text-primary-foreground">
  Primary content
</div>

<div className="bg-success text-success-foreground">
  Success message
</div>

<div className="bg-error text-error-foreground">
  Error message
</div>`,
    tags: ['color', 'tokens', 'brand', 'semantic'],
  },
  {
    id: 'foundations-typography',
    group: 'Foundations',
    title: 'Typography',
    description: 'Font families, sizes, weights, and line heights for consistent text styling.',
    DemoComponent: TypographyDemo,
    code: `// Typography examples
<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-bold">Heading 2</h2>
<p className="text-base text-foreground">Body text</p>
<p className="text-sm text-muted-foreground">Muted text</p>`,
    tags: ['typography', 'font', 'text'],
  },
  {
    id: 'foundations-spacing',
    group: 'Foundations',
    title: 'Spacing',
    description: 'Consistent spacing scale from 0-24 (4px increments). Use with padding, margin, and gap utilities.',
    DemoComponent: SpacingDemo,
    code: `// Using spacing scale
<div className="p-4 gap-4">
  <div className="mb-6">Content</div>
</div>`,
    tags: ['spacing', 'padding', 'margin', 'gap'],
  },
  {
    id: 'foundations-radii',
    group: 'Foundations',
    title: 'Border Radius',
    description: 'Consistent border radius tokens for rounded corners.',
    DemoComponent: RadiiDemo,
    code: `// Border radius examples
<div className="rounded-lg">Card</div>
<div className="rounded-xl">Large card</div>
<div className="rounded-full">Pill</div>`,
    tags: ['radius', 'border', 'rounded'],
  },
  {
    id: 'foundations-shadows',
    group: 'Foundations',
    title: 'Shadows',
    description: 'Elevation and depth through shadow tokens.',
    DemoComponent: ShadowsDemo,
    code: `// Shadow examples
<div className="shadow-sm">Small shadow</div>
<div className="shadow-card">Card shadow</div>
<div className="shadow-elevated">Elevated surface</div>`,
    tags: ['shadow', 'elevation', 'depth'],
  },
  {
    id: 'foundations-motion',
    group: 'Foundations',
    title: 'Motion',
    description: 'Animation durations and easing functions for smooth transitions.',
    DemoComponent: MotionDemo,
    code: `// Motion tokens
<div className="transition-all duration-normal ease-standard">
  Animated content
</div>`,
    tags: ['motion', 'animation', 'transition', 'easing'],
  },
  
  // Layout
  {
    id: 'layout-layout',
    group: 'Layout',
    title: 'Layout Primitives',
    description: 'Container, Stack, Grid, Spacer, and Divider components for building consistent layouts.',
    DemoComponent: LayoutDemo,
    code: `import { Container } from '../../components/ui/container';
import { Stack } from '../../components/ui/stack';
import { Grid } from '../../components/ui/grid';

<Container>
  <Stack gap={4}>
    <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
      {/* Items */}
    </Grid>
  </Stack>
</Container>`,
    tags: ['layout', 'container', 'stack', 'grid'],
  },
  
  // Components
  {
    id: 'components-button',
    group: 'Components',
    title: 'Button',
    description: 'Primary action button with multiple variants and sizes.',
    DemoComponent: ButtonDemo,
    code: `import { Button } from '../../components/ui/button';

<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="gradient">Gradient</Button>
<Button variant="destructive">Delete</Button>`,
    tags: ['button', 'action', 'click'],
    hasProps: true,
  },
  {
    id: 'components-input',
    group: 'Components',
    title: 'Input',
    description: 'Text input field with focus states and validation support.',
    DemoComponent: InputDemo,
    code: `import { Input } from '../../components/ui/input';

<Input placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input disabled placeholder="Disabled" />`,
    tags: ['input', 'form', 'text'],
    hasProps: true,
  },
  {
    id: 'components-textarea',
    group: 'Components',
    title: 'Textarea',
    description: 'Multi-line text input for longer content with configurable rows.',
    DemoComponent: TextareaDemo,
    code: `import { Textarea } from '../../components/ui/textarea';

<Textarea placeholder="Enter your message..." />
<Textarea rows={6} placeholder="Large textarea" />
<Textarea disabled placeholder="Disabled" />`,
    tags: ['textarea', 'form', 'text', 'multiline'],
    hasProps: true,
  },
  {
    id: 'components-date-picker',
    group: 'Components',
    title: 'Date Picker',
    description: 'Modern calendar date picker with gradient selected states, smooth animations, and clean design. Features month navigation, today/clear buttons, and date range validation.',
    DemoComponent: DatePickerDemo,
    code: `import { DatePicker, DatePickerTrigger, DatePickerContent } from '../../components/ui/date-picker';

<DatePicker value={date} onValueChange={setDate} minDate={today}>
  <DatePickerTrigger placeholder="Select date..." />
  <DatePickerContent />
</DatePicker>`,
    tags: ['date', 'picker', 'calendar', 'form', 'modern', '3D', 'gradient'],
    hasProps: true,
  },
  {
    id: 'components-time-picker',
    group: 'Components',
    title: 'Time Picker',
    description: 'Modern time picker with scrollable hour/minute selection. Supports 12-hour and 24-hour formats, with gradient selected states and smooth animations.',
    DemoComponent: TimePickerDemo,
    code: `import { TimePicker, TimePickerTrigger, TimePickerContent } from '../../components/ui/time-picker';

<TimePicker value={time} onValueChange={setTime} format="12h" interval={15}>
  <TimePickerTrigger placeholder="Select time..." />
  <TimePickerContent />
</TimePicker>`,
    tags: ['time', 'picker', 'clock', 'form', 'modern', '3D', 'gradient'],
    hasProps: true,
  },
  {
    id: 'components-select',
    group: 'Components',
    title: 'Select',
    description: 'Custom branded dropdown with gradient borders, animated chevron, and brand-colored selections. Fully accessible with keyboard navigation.',
    DemoComponent: SelectDemo,
    code: `import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger placeholder="Select an option...">
    <SelectValue placeholder="Select an option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
    <SelectItem value="3">Option 3</SelectItem>
  </SelectContent>
</Select>`,
    tags: ['select', 'form', 'dropdown', 'choice', 'branded', 'gradient'],
    hasProps: true,
  },
  {
    id: 'components-checkbox',
    group: 'Components',
    title: 'Checkbox',
    description: 'Boolean input for selecting one or multiple options.',
    DemoComponent: CheckboxDemo,
    code: `import { Checkbox } from '../../components/ui/checkbox';

<label className="flex items-center gap-2">
  <Checkbox />
  <span>Accept terms</span>
</label>
<Checkbox defaultChecked />
<Checkbox disabled />`,
    tags: ['checkbox', 'form', 'boolean', 'selection'],
    hasProps: true,
  },
  {
    id: 'components-radio',
    group: 'Components',
    title: 'Radio',
    description: 'Single choice input for selecting one option from a group.',
    DemoComponent: RadioDemo,
    code: `import { Radio } from '../../components/ui/radio';

<label className="flex items-center gap-2">
  <Radio name="size" value="small" />
  <span>Small</span>
</label>
<label className="flex items-center gap-2">
  <Radio name="size" value="medium" defaultChecked />
  <span>Medium</span>
</label>`,
    tags: ['radio', 'form', 'choice', 'single'],
    hasProps: true,
  },
  {
    id: 'components-switch',
    group: 'Components',
    title: 'Switch',
    description: 'Toggle switch for on/off states and boolean settings.',
    DemoComponent: SwitchDemo,
    code: `import { Switch } from '../../components/ui/switch';

<label className="flex items-center gap-2">
  <Switch checked={enabled} onClick={() => setEnabled(!enabled)} />
  <span>Enable notifications</span>
</label>
<Switch checked={true} />
<Switch disabled />`,
    tags: ['switch', 'toggle', 'form', 'boolean'],
    hasProps: true,
  },
  {
    id: 'components-card',
    group: 'Components',
    title: 'Card',
    description: 'Container component for grouping related content with consistent styling.',
    DemoComponent: CardDemo,
    code: `import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>`,
    tags: ['card', 'container', 'panel'],
    hasProps: true,
  },
  {
    id: 'components-badge',
    group: 'Components',
    title: 'Badge',
    description: 'Small status indicator with semantic color variants.',
    DemoComponent: BadgeDemo,
    code: `import { Badge } from '../../components/ui/badge';

<Badge>Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>`,
    tags: ['badge', 'status', 'indicator'],
  },
  {
    id: 'components-alert',
    group: 'Components',
    title: 'Alert',
    description: 'Banner component for displaying important messages with semantic variants.',
    DemoComponent: AlertDemo,
    code: `import { Alert, AlertTitle, AlertDescription, AlertIcon } from '../../components/ui/alert';

<Alert variant="success">
  <AlertIcon variant="success" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed successfully.</AlertDescription>
</Alert>`,
    tags: ['alert', 'message', 'notification'],
  },
  {
    id: 'components-tabs',
    group: 'Components',
    title: 'Tabs',
    description: 'Tabbed navigation component for organizing content into sections.',
    DemoComponent: TabsDemo,
    code: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`,
    tags: ['tabs', 'navigation', 'sections'],
  },
  {
    id: 'components-table',
    group: 'Components',
    title: 'Table',
    description: 'Data table component with hover states and consistent styling.',
    DemoComponent: TableDemo,
    code: `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    tags: ['table', 'data', 'grid'],
  },
  {
    id: 'components-progress',
    group: 'Components',
    title: 'Progress',
    description: 'Progress bar component for showing completion status.',
    DemoComponent: ProgressDemo,
    code: `import { Progress } from '../../components/ui/progress';

<Progress value={50} />`,
    tags: ['progress', 'bar', 'loading'],
  },
  {
    id: 'components-spinner',
    group: 'Components',
    title: 'Spinner',
    description: 'Loading spinner component in multiple sizes.',
    DemoComponent: SpinnerDemo,
    code: `import { Spinner } from '../../components/ui/spinner';

<Spinner size="md" />`,
    tags: ['spinner', 'loading', 'indicator'],
  },
  {
    id: 'components-skeleton',
    group: 'Components',
    title: 'Skeleton',
    description: 'Placeholder component for loading states.',
    DemoComponent: SkeletonDemo,
    code: `import { Skeleton } from '../../components/ui/skeleton';

<Skeleton className="h-4 w-full" />
<Skeleton className="h-12 w-12 rounded-full" />`,
    tags: ['skeleton', 'loading', 'placeholder'],
  },
  {
    id: 'components-dialog',
    group: 'Components',
    title: 'Dialog',
    description: 'Modal dialog component for overlays and confirmations.',
    DemoComponent: DialogDemo,
    code: `import { Dialog } from '../../components/ui/dialog';

<Dialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <div className="p-6">
    <h2>Dialog Title</h2>
    <p>Content here</p>
  </div>
</Dialog>`,
    tags: ['dialog', 'modal', 'overlay'],
  },
  {
    id: 'components-toast',
    group: 'Components',
    title: 'Toast',
    description: 'Toast notifications using sonner library. Supports success, error, warning, info, loading, and promise states.',
    DemoComponent: ToastDemo,
    code: `import { toast } from "sonner";

// Basic usage
toast.success("Operation completed!");
toast.error("Something went wrong!");

// With description
toast.success("Saved!", {
  description: "Your changes have been saved.",
});

// Loading toast
const toastId = toast.loading("Processing...");
setTimeout(() => {
  toast.success("Done!", { id: toastId });
}, 2000);

// Promise toast
toast.promise(fetchData(), {
  loading: "Loading...",
  success: "Data loaded!",
  error: "Failed to load",
});`,
    tags: ['toast', 'notification', 'sonner', 'alert'],
  },
  
  // Patterns
  {
    id: 'patterns-page-header',
    group: 'Patterns',
    title: 'PageHeader',
    description: 'Standard page header with title, description, and action buttons.',
    DemoComponent: PageHeaderDemo,
    code: `import { PageHeader } from '../../components/ui/page-header';

<PageHeader
  title="Page Title"
  description="Page description"
  actions={<Button>Action</Button>}
/>`,
    tags: ['header', 'page', 'title'],
  },
  {
    id: 'patterns-section-header',
    group: 'Patterns',
    title: 'SectionHeader',
    description: 'Section header component for organizing content within a page.',
    DemoComponent: SectionHeaderDemo,
    code: `import { SectionHeader } from '../../components/ui/section-header';

<SectionHeader
  title="Section Title"
  description="Optional description"
  actions={<Button size="sm">Action</Button>}
/>`,
    tags: ['header', 'section', 'title'],
  },
  {
    id: 'patterns-stat-card',
    group: 'Patterns',
    title: 'StatCard',
    description: 'Card component for displaying statistics and metrics.',
    DemoComponent: StatCardDemo,
    code: `import { StatCard } from '../../components/ui/stat-card';

<StatCard
  title="Total Users"
  value="1,234"
  description="+12% from last month"
  icon={<Users />}
/>`,
    tags: ['card', 'stat', 'metric'],
  },
  {
    id: 'patterns-empty-state',
    group: 'Patterns',
    title: 'EmptyState',
    description: 'Display when there is no data to show.',
    DemoComponent: EmptyStateDemo,
    code: `import { EmptyState } from '../../components/ui/empty-state';

<EmptyState
  icon={<Package />}
  title="No items found"
  description="Get started by creating your first item."
  action={{ label: "Create Item", onClick: handleCreate }}
/>`,
    tags: ['empty', 'state', 'no-data'],
  },
  {
    id: 'patterns-loading-state',
    group: 'Patterns',
    title: 'LoadingState',
    description: 'Loading indicator component with spinner or skeleton variants.',
    DemoComponent: LoadingStateDemo,
    code: `import { LoadingState } from '../../components/ui/loading-state';

<LoadingState message="Loading..." />
<LoadingState variant="skeleton" />`,
    tags: ['loading', 'state', 'spinner'],
  },
  {
    id: 'patterns-error-state',
    group: 'Patterns',
    title: 'ErrorState',
    description: 'Error display component with optional retry action.',
    DemoComponent: ErrorStateDemo,
    code: `import { ErrorState } from '../../components/ui/error-state';

<ErrorState
  title="Failed to load"
  message="Something went wrong."
  action={{ label: "Retry", onClick: handleRetry }}
/>`,
    tags: ['error', 'state', 'failure'],
  },
  {
    id: 'patterns-data-toolbar',
    group: 'Patterns',
    title: 'DataToolbar',
    description: 'Toolbar component for filtering, searching, and managing data lists.',
    DemoComponent: DataToolbarDemo,
    code: `import { DataToolbar } from '../../components/ui/data-toolbar';

<DataToolbar
  searchValue={search}
  onSearchChange={setSearch}
  filters={<Button>Filter</Button>}
  actions={<Button>Add New</Button>}
/>`,
    tags: ['toolbar', 'search', 'filter'],
  },
  {
    id: 'patterns-sidebar',
    group: 'Patterns',
    title: 'Sidebar',
    description: 'Modern SaaS sidebar navigation with 6 design variations. Features brand gradients, glassmorphism, and sleek animations. Supports both admin and customer portal styles.',
    DemoComponent: SidebarDemo,
    code: `import { Sidebar } from '../../components/ui/sidebar';

<Sidebar
  variant="minimal"
  navItems={navItems}
  activeItem="/admin/estimates"
  title="Admin Portal"
  subtitle="Superadmin"
/>`,
    tags: ['sidebar', 'navigation', 'menu', 'saaS', 'modern'],
  },
  
  // Compositions
  {
    id: 'compositions-estimates-list',
    group: 'Compositions',
    title: 'Estimates List',
    description: 'Example layout for displaying a list of estimates with filters and actions.',
    DemoComponent: EstimatesListDemo,
    code: `// Full composition example
<PageHeader title="Estimates" actions={<Button>New</Button>} />
<DataToolbar searchValue={search} onSearchChange={setSearch} />
<Table>...</Table>`,
    tags: ['composition', 'list', 'table', 'estimates'],
  },
  {
    id: 'compositions-photo-upload',
    group: 'Compositions',
    title: 'Photo Upload',
    description: 'Example layout for photo upload progress and status tracking.',
    DemoComponent: PhotoUploadDemo,
    code: `// Photo upload composition
<SectionHeader title="Upload Photos" />
<Progress value={progress} />
<Card>...</Card>`,
    tags: ['composition', 'upload', 'photos', 'progress'],
  },
  {
    id: 'compositions-dashboard-overview',
    group: 'Compositions',
    title: 'Dashboard Overview',
    description: 'Example dashboard layout with metrics cards and overview sections.',
    DemoComponent: DashboardOverviewDemo,
    code: `// Dashboard composition
<PageHeader title="Dashboard" />
<Grid cols={{ sm: 1, md: 2, lg: 4 }}>
  <StatCard title="Users" value="1,234" />
</Grid>`,
    tags: ['composition', 'dashboard', 'metrics', 'overview'],
  },
  {
    id: 'compositions-booking',
    group: 'Compositions',
    title: 'Booking Form',
    description: 'Modern booking component with form and confirmation states. Features 3D elevation effects, smooth animations, gradient buttons, and clean design using design system components.',
    DemoComponent: BookingDemo,
    code: `import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '../../components/ui/alert';

<Card className="shadow-elevated">
  <CardHeader>
    <CardTitle>Schedule Installation</CardTitle>
  </CardHeader>
  <CardContent>
    <form className="space-y-6">
      <Input type="date" className="rounded-xl" />
      <Input type="time" className="rounded-xl" />
      <Textarea placeholder="Additional notes..." className="rounded-xl" />
    </form>
  </CardContent>
  <CardFooter>
    <Button className="bg-gradient-to-r from-primary to-secondary">
      Confirm Booking
    </Button>
  </CardFooter>
</Card>`,
    tags: ['composition', 'booking', 'form', 'calendar', 'schedule', '3D', 'modern', 'SaaS'],
  },
];

// Helper to get item by ID
export function getItemById(id) {
  return registry.find(item => item.id === id);
}

// Helper to get items by group
export function getItemsByGroup(group) {
  return registry.filter(item => item.group === group);
}

// Helper to search items
export function searchItems(query) {
  const lowerQuery = query.toLowerCase();
  return registry.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

// Get all groups
export function getGroups() {
  return [...new Set(registry.map(item => item.group))];
}

