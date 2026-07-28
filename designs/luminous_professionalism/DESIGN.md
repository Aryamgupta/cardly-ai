---
name: Luminous Professionalism
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464554'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#595e71'
  on-tertiary: '#ffffff'
  tertiary-container: '#72768a'
  on-tertiary-container: '#020413'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#dee1f9'
  tertiary-fixed-dim: '#c1c5dc'
  on-tertiary-fixed: '#161b2b'
  on-tertiary-fixed-variant: '#414658'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a premium SaaS experience that bridges the gap between traditional corporate networking and cutting-edge artificial intelligence. The brand personality is authoritative yet visionary, instilling confidence through a "Clean & Tech-Forward" aesthetic. 

The visual direction utilizes a **Modern Corporate** style infused with **Glassmorphism** and **Subtle Glow** effects. It prioritizes high-end professional utility by using deep indigo foundations contrasted against sharp, vibrant accents. The emotional response is one of efficiency, intelligence, and high-status networking. Whitespace is used aggressively to signal a premium, uncluttered service, while AI-driven features are distinguished by soft, ethereal gradients rather than literal iconography.

## Colors

This design system uses a dual-natured palette to distinguish between high-focus management and immersive AI interactions. 

- **Foundations:** The primary background for content is a soft off-white (`#F8FAFC`), providing a clean canvas for information density.
- **Brand Core:** "Electric Indigo" serves as the workhorse for primary actions, while "AI Violet" is reserved strictly for generative or predictive features.
- **Deep Surfaces:** For sidebars, headers, or immersive "Dark Mode" sections, use "Deep Navy" (`#0B1020`) as the background and "Dark Slate" (`#151B2E`) for elevated surface elements like cards and modals.
- **Semantic Logic:** Success states use a crisp emerald. Muted text avoids pure grey, opting for a slate-blue tint to maintain the sophisticated atmosphere.

## Typography

The typography relies entirely on **Inter** to leverage its systematic clarity and high legibility in data-heavy environments. 

The hierarchy is built on tight tracking for headlines to create a "locked-in," professional look. Large display styles use a semi-bold or bold weight with negative letter spacing for a high-impact, modern feel. Body text maintains a standard 1.5x line height for optimal readability. Labels and utility text use a slightly increased letter spacing and medium weights to ensure they are distinguishable from body paragraphs at small sizes.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with a 12-column structure for desktop. To maintain the "spacious" brand promise, horizontal margins are generous, scaling from 16px on mobile to 40px+ on large displays.

- **Vertical Rhythm:** A strict 4px baseline grid ensures alignment. Use 16px (`stack-md`) for standard component spacing and 32px (`stack-lg`) for section headers.
- **Content Width:** Main content is capped at 1280px to prevent excessive line lengths in data tables and card views.
- **AI Reflow:** When AI panels or insights are triggered, the layout should utilize a "sliding drawer" or "side-panel" overlay that shifts the primary grid rather than compressing it, maintaining the user's focus.

## Elevation & Depth

This design system uses **Ambient Shadows** and **Tonal Layers** to create a sense of organized depth.

- **Level 1 (Base):** Off-white background with a subtle 1px border (`#E2E8F0`).
- **Level 2 (Cards):** White background with a soft, multi-layered shadow (0px 4px 20px rgba(0,0,0,0.05)).
- **Level 3 (Modals/AI Panels):** Glassmorphic surfaces using a 12px backdrop blur and semi-transparent indigo tinting (rgba(21, 27, 46, 0.8) for dark surfaces).
- **AI States:** Surfaces related to AI use a "Inner Glow" technique—a subtle, 1px inset border with a 10% opacity violet gradient—to make them feel digitally "alive."

## Shapes

The shape language is defined by **Rounded** aesthetics to feel approachable yet modern. 

Standard components (inputs, small buttons) use a 0.5rem radius. However, the system utilizes "Progressive Rounding" for larger elements:
- **Primary Containers:** Use `rounded-lg` (1rem) for most dashboard cards.
- **Business Card Previews:** Use `rounded-xl` (1.5rem) to mimic the feel of premium physical cards.
- **Interactive Triggers:** Floating action buttons and search bars may utilize pill-shapes to differentiate them from static content.

## Components

### Buttons
- **Primary:** Solid Electric Indigo with white text. Subtle hover state: 10% darkening.
- **AI CTA:** Gradient from Electric Indigo to AI Violet. Includes a soft violet outer glow (blur: 8px) on hover.
- **Ghost:** Transparent background with 1px indigo border for secondary actions.

### Cards & Business Cards
- Dashboard cards use white backgrounds and `rounded-lg` corners.
- Business card previews use a fixed aspect ratio (3.5:2) and high-elevation shadows to appear as if they are floating above the UI.

### Inputs & Fields
- Use a 1px border (`#CBD5E1`) that transitions to Electric Indigo on focus. 
- Labels sit above the input in `label-sm` style.

### AI Feedback & Chips
- Chips used for AI-suggested tags use a light violet background (5% opacity) with a 1px violet border.
- The "AI processing" state is indicated by a shimmering horizontal gradient line across the top of the relevant card, rather than a spinner.

### Navigation
- **Sidebar:** Utilizes the "Deep Navy" foundation with "Dark Slate" active states. Icons are simplified line-art.