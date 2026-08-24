---
name: Secure-Flow Design System
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
  on-surface-variant: '#4a4455'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#7b7487'
  outline-variant: '#ccc3d8'
  surface-tint: '#732ee4'
  primary: '#630ed4'
  on-primary: '#ffffff'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#d2bbff'
  secondary: '#5c5d6f'
  on-secondary: '#ffffff'
  secondary-container: '#dedef4'
  on-secondary-container: '#606174'
  tertiary: '#4b4f56'
  on-tertiary: '#ffffff'
  tertiary-container: '#63676e'
  on-tertiary-container: '#e3e6ee'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#e1e1f7'
  secondary-fixed-dim: '#c4c5da'
  on-secondary-fixed: '#191a2a'
  on-secondary-fixed-variant: '#444657'
  tertiary-fixed: '#dfe2ea'
  tertiary-fixed-dim: '#c3c6ce'
  on-tertiary-fixed: '#181c21'
  on-tertiary-fixed-variant: '#43474d'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  padding-card: 32px
---

## Brand & Style
The design system is engineered to evoke maximum trust, security, and institutional authority while maintaining the frictionless experience of a modern SaaS product. It targets a broad demographic—from tech-savvy digital natives to first-time digital voters—necessitating a UI that is "invisible" in its ease of use but "premium" in its execution.

The aesthetic direction is **Modern Corporate/SaaS** with a **Glassmorphic** layer. It utilizes a sophisticated contrast between deep, dark "Command" surfaces for navigation and light, high-clarity "Action" surfaces for the voting process. This dichotomy clearly separates the system's architecture from the user's active tasks, reducing cognitive load and focusing attention on the vote.

## Colors
The palette is built on a foundation of **Deep Navy (#0A0C1B)** for primary branding and navigation, creating a sense of "The Vault" or high-level security. **Electric Purple (#7C3AED)** serves as the primary action color, used for CTA buttons, progress states, and active highlights. 

To maintain high legibility during the voting process, the system uses a **Light Surface** strategy. Content cards and forms live on white or soft-tinted off-white backgrounds. A subtle "Safety Blue" (Tertiary) is used for secondary backgrounds to differentiate content sections without creating visual noise. Gradients should be used sparingly, primarily on high-impact moments like "Vote Submitted" or primary hero headers.

## Typography
This design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic, utilitarian feel. The type hierarchy is intentionally "top-heavy" for headlines to ensure users always know exactly which step of the process they are in.

- **Weight Usage:** Use Bold (700) for primary headlines, Semi-bold (600) for sub-headers and labels, and Regular (400) for body copy.
- **Micro-copy:** Small labels (label-sm) are used for metadata like "Transaction ID" or "Voter ID" to keep the UI clean.
- **Accessibility:** Ensure all body text maintains a minimum contrast ratio of 4.5:1 against its background.

## Layout & Spacing
The system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

A generous spacing rhythm based on an **8px scale** is used to create an "airy" and approachable feel. For critical voting screens, a **Fixed Grid** of 800px width is recommended to keep form elements centered in the user's focal point, preventing eye strain. 

**Progressive Disclosure:** Information is revealed in stages. Each "Step" in the voting flow should occupy its own card or screen area to eliminate clutter and distractions.

## Elevation & Depth
Depth is created through a combination of **Tonal Layers** and **Soft Ambient Shadows**. 

1.  **Level 0 (Background):** Solid neutrals (#F4F7FF or #0A0C1B).
2.  **Level 1 (Cards):** White surfaces with a 1px border (#E2E8F0) and a very soft, diffused shadow (0px 10px 30px rgba(0,0,0,0.04)).
3.  **Level 2 (Active Elements/Modals):** Glassmorphism is applied here—20px backdrop blur with a 40% white overlay and a subtle inner glow.
4.  **Interactive States:** On hover, cards should slightly lift (increase shadow spread) to indicate interactivity.

## Shapes
The shape language is defined by **Ultra-Roundedness**. This softens the "serious" nature of a voting platform, making it feel modern and friendly.

- **Standard Containers:** Use `rounded-xl` (1.5rem / 24px) for cards and main content blocks.
- **Interactive Elements:** Buttons and Input fields use `rounded-lg` (1rem / 16px) or full pill-shapes for smaller tags/chips.
- **Icons:** Encased in circular or heavily rounded containers to maintain the soft aesthetic.

## Components
- **Buttons:** Large, high-contrast CTAs (min-height 56px). Use the Electric Purple gradient for primary actions and a "ghost" style with a 1px border for secondary actions.
- **Progress Indicators:** A horizontal "Stepper" at the top of the voting flow. Completed steps should turn Green with a checkmark; active steps should be Purple.
- **Voting Cards:** Large cards for candidate selection featuring high-res avatars, clear name typography, and a "Radio Button" that highlights the entire card border when selected.
- **Input Fields:** Minimalist design with floating labels. Focus state should trigger a subtle purple glow and a 2px border.
- **Verification Icons:** Use thick-stroke, minimalist icons for Biometric, OTP, and Identity steps to reduce reliance on long-form instruction text.
- **Status Toasts:** Use rounded pill-shaped toasts for "Copy to Clipboard" or "Saving" notifications, appearing at the top-center.