# Xenogenesis Lab — Design

## Design direction

Xenogenesis Lab should feel like a modern scientific instrument rather than
a fantasy creature generator.

Desired qualities:

- futuristic
- scientific
- precise
- atmospheric
- readable
- visually memorable

Avoid:

- cluttered spaceship interfaces
- excessive neon
- fantasy styling
- game-like stat overload
- imitation of established science-fiction franchises

## Colors

Primary palette:

- deep navy or near-black background
- cyan or teal scientific accents
- cool white text
- muted blue-gray secondary text

Semantic colors:

- green: viable or favorable
- amber: demanding or uncertain
- red: dangerous or incompatible
- blue: neutral scientific information

Exact values:

```text
Background: #030817
Surface: #0F1A34 with translucent glass panels
Primary accent: #67E8F9
Secondary accent: #0E7490
Main text: #E5F4FF
Muted text: #94A3B8
Success: #86EFAC
Warning: #FDE68A
Error: #FCA5A5
```

## Typography

Use:

- one clear display typeface for headings
- one highly readable interface typeface
- limited font weights
- short line lengths for scientific explanations

Avoid decorative fonts for body text.

## Main screen layout

Recommended structure:

```text
Header
├── logo
├── project name
└── reset or example action

Main content
├── world configuration panel
├── environment preview
├── simulation action
└── organism result

Result section
├── generated illustration
├── organism summary
├── adaptation cards
├── environmental connections
└── scientific limitations
```

On desktop:

- parameters on the left
- visualization and results on the right

On mobile:

- stacked sections
- primary action always easy to find

## Loading states

Use distinct progress stages:

```text
Analyzing environment
Deriving biological constraints
Generating organism dossier
Creating scientific illustration
```

Loading states should:

- explain what is happening
- avoid fake precision
- preserve the configured world
- allow recovery after failure

## Empty state

Before the first simulation:

- show a short explanation
- provide a visually interesting example
- include one-click example-world presets
- make the primary action obvious

## Error states

Errors should:

- explain the failed stage
- avoid technical jargon
- preserve completed results
- allow retrying only the failed stage where possible

Example:

```text
The environmental simulation completed, but the illustration could not be
generated. You can retry the image without running the simulation again.
```

## Accessibility

Minimum requirements:

- keyboard-accessible controls
- visible focus states
- semantic labels
- sufficient contrast
- no information conveyed only by color
- descriptive image alternative text
- reduced-motion support
- readable text at browser zoom
- accessible slider values and units

## Illustration rules

Illustrations should look like:

- scientific concept art
- astrobiology field documentation
- neutral specimen presentation
- a plausible organism inside its habitat

Illustrations should not:

- imitate known franchises or artists
- include recognizable copyrighted creatures
- add unsupported anatomical features
- contradict the organism dossier
- contain random interface text
- present speculative details as measured facts

The image prompt should include:

- habitat
- gravity-related posture
- atmosphere-related adaptations
- thermal adaptations
- radiation adaptations
- locomotion
- scale reference where useful
- scientific illustration composition

## Logo and branding

Project name:

```text
Xenogenesis Lab
```

The logo combines:

- planetary science
- biology
- evolution
- an orbital or DNA-inspired motif

Use the full logo for:

- project page
- README
- opening and closing demo frames

Use the symbol alone for:

- favicon
- compact navigation
- loading state
- social thumbnail where appropriate

Do not modify the logo proportions or add unrelated visual effects without
documenting a new approved variant.
