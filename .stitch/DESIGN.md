# Service Hub Design System (DESIGN.md)

## 1. Visual Theme & Philosophy
Service Hub is a modern, high-trust on-demand home service mobile application connecting verified professionals (plumbers, electricians, cleaners, etc.) with customers.
The visual identity is clean, purposeful, and reassuring, using a high-contrast palette with electric cobalt blue for trust and bold warm orange for call-to-actions.

**Core Rules:**
- **Zero Emojis**: Never use emojis in UI, labels, status tags, or cards. Use clean vector stroke icons (Lucide icon style).
- **Base Grid**: 8px modular scale (8px, 16px, 24px, 32px, 48px).
- **Horizontal Screen Padding**: Exactly 16px horizontal screen padding on all mobile views.
- **Typography**: Inter across all headings, body, and captions.

---

## 2. Color Palette & Tokens

| Token | Hex Value | Usage / Semantic Role |
| :--- | :--- | :--- |
| `primary` | `#1A6BFF` | Brand cobalt blue, active tabs, primary buttons, interactive links |
| `primary-hover` | `#1254CC` | Pressed/active state for primary actions |
| `secondary` | `#0D0D0D` | Near-black headers, deep dark surfaces, strong contrast elements |
| `background` | `#F7F8FA` | App screen background, subtle grouped list backgrounds |
| `surface` | `#FFFFFF` | Card backgrounds, modals, sheets, bottom navigation |
| `accent` | `#FF6B2B` | Warm orange CTA highlights, "Book Now" actions, key badges |
| `text-main` | `#0D0D0D` | Primary headings, titles, high-emphasis text |
| `text-muted` | `#6B7280` | Subtitles, helper text, timestamps, input placeholders |
| `border` | `#E5E7EB` | Card dividers, input outlines, subtle separators |
| `success` | `#16A34A` | Completed status, confirmed bookings, verified badge |
| `error` | `#DC2626` | Destructive actions, rejected/cancelled status, validation errors |
| `warning` | `#D97706` | Pending state, alerts, rating stars |

---

## 3. Typography Scale (Inter)

- **Display / Hero**: 28px, Bold (700), Line Height: 34px, Letter Spacing: -0.02em
- **Title 1 (H1)**: 22px, SemiBold (600), Line Height: 28px, Letter Spacing: -0.01em
- **Title 2 (H2)**: 18px, SemiBold (600), Line Height: 24px
- **Headline / Card Title**: 16px, Medium (500) / SemiBold (600), Line Height: 22px
- **Body Regular**: 14px, Regular (400), Line Height: 20px
- **Body Medium**: 14px, Medium (500), Line Height: 20px
- **Caption / Subtext**: 12px, Regular (400) & Medium (500), Line Height: 16px
- **Micro Badge**: 11px, SemiBold (600), Line Height: 14px, Uppercase tracking +0.05em

---

## 4. Spacing, Shapes & Elevation

- **Corner Radius**:
  - Small (`rounded-sm`): 6px (Badges, tags)
  - Medium (`rounded-md`): 10px (Inputs, buttons, small cards)
  - Large (`rounded-lg`): 16px (Primary cards, bottom sheets)
  - Full (`rounded-full`): 9999px (Pills, avatar images, icon badges)
- **Shadows & Elevation**:
  - Card Shadow: `0 2px 8px rgba(13, 13, 13, 0.05)`
  - Floating Action / Modal: `0 8px 24px rgba(13, 13, 13, 0.12)`
- **Layout Spacing**:
  - Screen Horizontal Padding: `16px`
  - Vertical Section Gap: `24px`
  - Card Internal Padding: `16px`
  - Item List Gap: `12px`

---

## 5. Component Patterns

### Buttons
- **Primary**: Background `#1A6BFF`, text `#FFFFFF`, radius 10px, height 48px, font 15px Medium.
- **Accent (CTA / Book Now)**: Background `#FF6B2B`, text `#FFFFFF`, radius 10px, height 48px, font 15px SemiBold.
- **Secondary**: Background `#F3F4F6`, text `#0D0D0D`, radius 10px, height 44px.
- **Outline**: Background transparent, border 1px `#E5E7EB`, text `#0D0D0D`, radius 10px.
- **Danger**: Background `#FEE2E2`, border 1px `#FECACA`, text `#DC2626`.

### Cards & Providers
- Surface `#FFFFFF`, border 1px `#E5E7EB`, radius 16px, padding 16px.
- Provider Card: Left avatar (52x52 rounded-full with verified check badge), Center title + category + rating + distance, Right price badge + "Book" CTA.

### Status Badges
- Pending: Background `#FEF3C7`, text `#D97706`
- Accepted / Ongoing: Background `#DBEAFE`, text `#1A6BFF`
- Completed: Background `#DCFCE7`, text `#16A34A`
- Cancelled / Rejected: Background `#FEE2E2`, text `#DC2626`

---

## 6. Design System Notes for Stitch Generation
Every screen must strictly embody:
- Primary color `#1A6BFF`, CTA Accent `#FF6B2B`, Background `#F7F8FA`.
- Clean card borders (`#E5E7EB`), crisp Inter sans-serif typography.
- High accessibility contrast, zero emojis, professional stroke icons.
- Exact 16px screen margin padding and standard mobile status/header bar ergonomics.
