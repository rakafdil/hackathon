## Overview

The AgriNexus web application uses **shadcn/ui** as its component library foundation, built on top of **Tailwind CSS** for utility-first styling. The design system employs CSS custom properties (design tokens) for theming, supports dark mode via class-based toggling, and follows a consistent agricultural-inspired color palette centered around emerald/green tones.

## Core Technology Stack

- **CSS Framework**: Tailwind CSS v3+ with PostCSS
- **Component Library**: shadcn/ui (Radix UI primitives under the hood)
- **Utility Helpers**: `clsx` + `tailwind-merge` via the `cn()` function
- **Variant Management**: `class-variance-authority` (CVA) for component variants
- **Icons**: Lucide React
- **Fonts**: Geist / Geist Mono (self-hosted WOFF files)
- **Toast Notifications**: Sonner

## Key Files & Architecture

### Configuration Files

- **`apps/web/tailwind.config.js`** — Defines content paths, extends theme with semantic color tokens mapped to CSS variables (`--primary`, `--background`, etc.), configures border-radius scale, and enables `tailwindcss-animate` plugin.
- **`apps/web/components.json`** — shadcn/ui configuration specifying `slate` base color, CSS variable mode enabled, RSC support, and path aliases (`@/components`, `@/lib/utils`).
- **`apps/web/postcss.config.js`** — Minimal PostCSS setup with `tailwindcss` and `autoprefixer` plugins.
- **`apps/web/lib/utils.ts`** — Exports the `cn()` helper that merges Tailwind classes safely using `clsx` and `tailwind-merge`.

### Design Tokens (globals.css)

- **`apps/web/app/globals.css`** — Central stylesheet defining:
  - **Light theme** (`:root`): Emerald-dominant palette (`--primary: 160 84% 39%`), slate neutrals, rounded corners at `0.625rem`.
  - **Dark theme** (`.dark`): Darker emerald tones (`--primary: 160 70% 45%`), deep backgrounds (`--background: 165 30% 7%`).
  - **Semantic color roles**: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, plus five chart colors.
  - **Custom utilities**: `.glass` / `.glass-dark` (backdrop blur effects), `.gradient-emerald` / `.gradient-emerald-radial` (linear/radial gradients), `.btn-emerald` (branded button style).
  - **Animation keyframes**: `fade-in`, `slide-up`, `slide-in-right`, `float`, `float-slow`, `pulse-soft` with corresponding utility classes and delay helpers.

### Component Structure

- **`apps/web/components/ui/`** — 17 shadcn/ui components (Button, Card, Input, Badge, Dialog, Sheet, Avatar, Tabs, Progress, Select, Table, Navigation Menu, Dropdown Menu, Separator, Label, Form, Alert Dialog). Each component:
  - Uses the `cn()` utility for class merging.
  - Employs CVA for variant definitions (e.g., Button has `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` variants and `sm`, `default`, `lg`, `icon` sizes).
  - Forwards refs and supports `asChild` pattern via Radix UI Slot.

## Design Conventions

### Color System

The palette is agriculture-themed with emerald as the primary brand color:

| Token | Light (HSL) | Dark (HSL) | Usage |
|-------|-------------|------------|-------|
| `--primary` | `160 84% 39%` | `160 70% 45%` | Main actions, active states |
| `--secondary` | `152 56% 96%` | `165 20% 16%` | Subtle backgrounds |
| `--accent` | `158 64% 52%` | `160 70% 45%` | Highlights, badges |
| `--destructive` | `0 84.2% 60.2%` | `0 62.8% 30.6%` | Errors, warnings |
| `--muted` | `150 30% 96%` | `165 20% 16%` | Disabled, secondary text |

Accent mapping in pages uses four semantic colors: `emerald` (success/planting), `red` (risk/alerts), `blue` (prices/data), `purple` (AI/features). Each maps to icon backgrounds, badge styles, progress bars, and text colors.

### Layout Patterns

- **Dashboard layout** (`app/(dashboard)/layout.tsx`): Fixed sidebar (264px desktop, sheet drawer mobile) with emerald logo, navigation items with active left-indicator bar, user profile footer with avatar and logout. Top header includes search bar, notification bell with badge count, and user avatar.
- **Page structure**: Max-width container (`max-w-7xl`) centered within padded main area. Cards use subtle borders (`border-gray-100`), light shadows (`shadow-sm`), and hover elevation (`hover:shadow-md`).
- **Responsive strategy**: Mobile-first with `md:` breakpoints for sidebar visibility, `sm:` for grid column expansion, `lg:` for wider layouts.

### Typography & Spacing

- Font family defaults to Tailwind's sans stack (Geist fonts loaded but not explicitly configured in `tailwind.config.js`).
- Heading hierarchy: `text-2xl font-bold` for page titles, `text-base/sm font-semibold` for section headers, `text-xs` for metadata/captions.
- Consistent spacing scale: `gap-3`/`gap-4` for card grids, `space-y-1.5`/`space-y-2.5` for vertical lists, `p-3`/`p-4`/`p-5`/`p-6` for card padding.

### Animation & Micro-interactions

- Custom animations defined in `globals.css`: fade-in (0.6s), slide-up (0.6s), slide-in-right (0.7s cubic-bezier), float (5s infinite), pulse-soft (4s infinite).
- Delay utilities: `.animation-delay-100` through `.animation-delay-1000`.
- Hover transitions: Cards lift (`hover:-translate-y-0.5`), icons scale (`group-hover:scale-110`), arrows shift position (`group-hover:translate-x-0.5`).
- Focus rings: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` on interactive elements.

## Developer Rules & Conventions

1. **Always use `cn()` for class composition** — Never concatenate Tailwind classes with template literals directly; use `cn(className, conditionalClass)` to ensure proper merge behavior.

2. **Use semantic color tokens, not raw values** — Reference `bg-primary`, `text-foreground`, `border-input` instead of hardcoded colors. For accent variations, use the `accentMap` pattern with `getAccent()` helper.

3. **Follow shadcn/ui component API** — Use CVA-defined variants (`variant`, `size`) rather than overriding with arbitrary classes. Extend via `className` prop merged through `cn()`.

4. **Maintain dark mode compatibility** — All new CSS variables must have both `:root` and `.dark` definitions. Test with `.dark` class on `<html>` element.

5. **Card structure convention** — Use `Card > CardHeader > CardTitle/CardDescription > CardContent > CardFooter` hierarchy. Apply `border-gray-100 shadow-sm` for consistent elevation.

6. **Responsive grid patterns** — Use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for stat cards, `grid-cols-1 lg:grid-cols-2` for two-column layouts.

7. **Icon usage** — Import from `lucide-react`, size with `h-4 w-4` (small), `h-5 w-5` (medium), `h-6 w-6` (large). Wrap in colored background divs using accent map.

8. **Animation discipline** — Prefer Tailwind's built-in `transition-*` utilities for simple state changes. Use custom keyframe classes only for entrance animations or continuous effects.

9. **Accessibility** — Maintain focus-visible rings, ensure sufficient color contrast (emerald on white passes WCAG AA), use semantic HTML elements, provide aria-labels on icon-only buttons.

10. **No inline styles for layout** — All spacing, sizing, positioning must use Tailwind utility classes. Inline styles are reserved only for dynamic values (e.g., progress percentages).
