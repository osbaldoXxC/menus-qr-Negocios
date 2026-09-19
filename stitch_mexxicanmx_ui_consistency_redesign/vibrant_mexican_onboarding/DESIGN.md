---
name: Vibrant Mexican Onboarding
colors:
  surface: '#f6faff'
  surface-dim: '#d2dbe4'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf5fe'
  surface-container: '#e6eff8'
  surface-container-high: '#e0e9f2'
  surface-container-highest: '#dbe4ed'
  on-surface: '#141d23'
  on-surface-variant: '#594139'
  inverse-surface: '#293138'
  inverse-on-surface: '#e9f2fb'
  outline: '#8d7168'
  outline-variant: '#e1bfb5'
  surface-tint: '#ab3500'
  primary: '#ab3500'
  on-primary: '#ffffff'
  primary-container: '#ff6b35'
  on-primary-container: '#5f1900'
  inverse-primary: '#ffb59d'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2e2e2'
  on-secondary-container: '#646464'
  tertiary: '#5c5f60'
  on-tertiary: '#ffffff'
  tertiary-container: '#989a9b'
  on-tertiary-container: '#2f3233'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832600'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c6'
  on-secondary-fixed: '#1b1b1b'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#f6faff'
  on-background: '#141d23'
  surface-variant: '#dbe4ed'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.4'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 2rem
  stack-gap-lg: 2.5rem
  stack-gap-md: 1.5rem
  grid-gutter: 1rem
  pill-padding-x: 1.25rem
  pill-padding-y: 0.75rem
---

## Brand & Style
The design system is centered on a high-energy, modern Mexican culinary experience. The brand personality is welcoming, appetizing, and culturally vibrant, utilizing a **Corporate / Modern** base with **Minimalist** clarity and **Tactile** depth. 

The goal is to move the user through the onboarding funnel with a sense of excitement and ease. Visuals are clean and organized to reduce cognitive load, while the "2xl/3xl" roundedness and soft shadows create a friendly, "squishy" physical metaphor that feels safe and modern. The style avoids clutter, replacing distracting emojis with sophisticated line-style icons to maintain a premium feel.

## Colors
The palette is dominated by a vibrant **Coral Orange** that stimulates appetite and signals action. 

- **Primary:** #FF6B35 (Coral) used for progress bars, active states, and selected borders.
- **Action:** #000000 (Black) used for primary buttons to provide maximum contrast and a bold, grounded anchor.
- **Secondary Text:** A medium gray (#6C757D) ensures secondary information is legible but doesn't compete with the bold titles.
- **Surface:** The background is not a flat white but a subtle vertical gradient from pure white to a very light gray, adding a sense of floor and ceiling to the digital space.

## Typography
We use **Plus Jakarta Sans** for its friendly, rounded terminals that complement the "2xl" shape language. 

Titles must be rendered in the **Bold** or **ExtraBold (800)** weights to establish a clear, authoritative hierarchy. Secondary text uses the **Medium** weight in gray to provide a soft contrast. Letter spacing is slightly tightened on large headlines to create a more impactful, editorial feel similar to high-end food magazines.

## Layout & Spacing
The layout follows a **Fixed Grid** approach for the onboarding cards to keep content centered and focused. 

- **Desktop:** A narrow central column (max-width: 560px) focuses the user’s attention on the decision at hand.
- **Mobile:** Elements stretch to 100% width with 24px side margins.
- **Rhythm:** We use a strict 8px base grid. Vertical rhythm is generous; headlines are separated from option sets by at least 40px (stack-gap-lg) to allow the UI to "breathe."

## Elevation & Depth
Depth is created through **Ambient Shadows**. Surfaces do not use harsh borders unless they are in an active state.

- **Main Cards/Containers:** Use a very diffused shadow with a subtle color tint from the primary orange (e.g., `0px 10px 30px rgba(255, 107, 53, 0.08)`).
- **Floating Elements:** Primary buttons and active selection pills have a slightly higher elevation to suggest they are "above" the background gradient.
- **Layering:** The progress bar sits at the very top of the hierarchy, anchored to the top of the screen or card, serving as a persistent navigational guide.

## Shapes
The shape language is extremely soft. 
- **Containers:** We use a custom **2rem (32px)** radius for main cards to match the "food swipe" aesthetic.
- **Buttons & Pills:** These are strictly **Pill-shaped**, using a 999px radius to ensure perfectly circular ends regardless of height.
- **Inputs:** Text fields and secondary containers should maintain a minimum of 1rem roundedness to stay consistent with the organic feel.

## Components

### Buttons
- **Primary:** Solid Black (#000000) fill, white text, pill-shaped. No shadow, or very minimal flat shadow.
- **Secondary:** Transparent background with a light gray (#DEE2E6) 1.5px outline. Pill-shaped.

### Option Pills (Selection)
- **Normal State:** White background, 1px light gray border, medium gray text.
- **Selected State:** Light orange tint background (5-10% opacity of #FF6B35), 2px solid orange border, black text.
- **Icons:** All icons must be thin-line style (2px stroke), monochrome gray or black, never emojis.

### Progress Bar
- **Track:** Very light gray or translucent white.
- **Fill:** Solid Coral (#FF6B35).
- **Animation:** Smooth ease-in-out transition when advancing steps.

### Cards
- Large "2xl/3xl" corners.
- Background: Pure White.
- Shadow: Soft, wide-spread ambient glow.

### Input Fields
- Large rounded corners (1rem).
- Subtle gray background (#F8F9FA).
- Placeholder text in medium gray.