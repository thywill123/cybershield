// Shared "Liquid Glass" design tokens — frosted translucency with a specular
// top-edge highlight, used consistently across pages. Built on the app's
// existing dark navy palette so it reads as a refinement, not a re-theme.

// Base frosted glass surface. `saturate()` alongside blur is what gives real
// glass its vividness — blur alone just looks like a dim overlay.
export const glassSurface = (opacity = 0.55) => ({
  background: `rgba(18, 26, 54, ${opacity})`,
  backdropFilter: 'blur(22px) saturate(180%)',
  WebkitBackdropFilter: 'blur(22px) saturate(180%)',
})

// Standard glass card: frosted surface + thin border + specular top edge
// (the inset white line simulating light catching the top of the glass)
// + soft ambient shadow for depth.
export const glassCard = {
  ...glassSurface(0.55),
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.14),
    inset 0 0 0 1px rgba(255,255,255,0.02),
    0 8px 32px rgba(0,0,0,0.45)
  `,
}

export const glassCardHover = {
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.22),
    inset 0 0 0 1px rgba(255,255,255,0.03),
    0 12px 40px rgba(0,0,0,0.5)
  `,
  transform: 'translateY(-2px)',
}

// Navbar: slightly more opaque + stronger blur so content never fights with
// text scrolling beneath it.
export const glassNav = {
  ...glassSurface(0.62),
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.35)',
}

// Pill-shaped primary button — glass surface over a color wash, with a
// bright specular highlight along the top third (the core "liquid glass"
// button look: it reads as a lit glass capsule, not a flat gradient fill).
export const glassPillPrimary = (hueRgb = '45,140,255') => ({
  background: `linear-gradient(180deg, rgba(${hueRgb},0.95) 0%, rgba(${hueRgb},0.75) 60%, rgba(${hueRgb},0.85) 100%)`,
  backdropFilter: 'blur(12px) saturate(160%)',
  WebkitBackdropFilter: 'blur(12px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: '999px',
  boxShadow: `
    inset 0 1.5px 0 rgba(255,255,255,0.55),
    inset 0 -8px 16px rgba(0,0,0,0.15),
    0 6px 24px rgba(${hueRgb},0.35)
  `,
})

// Pill-shaped ghost/secondary button — clear glass, no color wash.
export const glassPillGhost = {
  ...glassSurface(0.35),
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: '999px',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 16px rgba(0,0,0,0.25)',
}

// Small glass chip/pill (badges, tags, stat sub-labels).
export const glassChip = {
  ...glassSurface(0.4),
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '999px',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
}