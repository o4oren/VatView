# Sprint Change Proposal — Single Card Progressive Disclosure

**Date:** 2026-03-17
**Author:** Oren (facilitated by BMAD correct-course workflow)
**Change Scope:** Minor — Direct implementation by dev team

---

## Section 1: Issue Summary

**Problem Statement:** The current progressive disclosure model for detail panels uses 3 separate sub-components per detail type (Level1, Level2, Level3) rendered additively based on `disclosureLevel` state from DetailPanelProvider. This requires 15 sub-components total (5 detail types × 3 levels), conditional rendering logic in every detail view, and tight coupling between the provider's disclosure level and content rendering.

**Discovery Context:** Identified during/after Story 4.2 (Pilot Detail) implementation. With 4.3 (ATC/CTR) and 4.4 (Airport) not yet started, this is the optimal moment to simplify before the pattern proliferates.

**Evidence:** The bottom sheet already has peek/half/full snap points that physically gate what the user sees. The three-level content model duplicates this gating in code. A single complete card per detail type, ordered by information priority, achieves an identical user experience with the sheet mechanics doing all the work.

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Impact | Details |
|---|---|---|
| **Epic 4 (Progressive Disclosure)** | Modified | Stories 4.2, 4.3, 4.4 updated to single-card pattern. New Story 4.2.1 inserted for pilot refactor. |
| **Epic 7 (Orientation & Layout)** | Minor update | Story 7.2 (SidePanel) simplified — renders same single card with scroll. |
| **Epics 1-3, 5-6, 8** | No impact | — |

### Artifact Conflicts

| Artifact | Sections Affected | Change Type |
|---|---|---|
| **PRD** | FR9, FR10, FR11 | Reword to describe snap-point-driven visibility instead of numbered levels. Add FR11a for single-card model. |
| **Architecture** | Progressive disclosure constraints | Replace "15 sub-components" with "5 detail card components". Remove additive rendering language. |
| **UX Spec** | DetailSheet, interaction flow, component table, spacing rule, migration table, disclosure patterns | Reframe from level-based content switching to single card with priority-ordered content. |
| **Epics** | Stories 4.2, 4.3, 4.4, 7.2 + new 4.2.1 | Updated acceptance criteria throughout. |

### Technical Impact

- **Reduced component count:** 15 level sub-components → 5 detail card components
- **Simplified state:** `disclosureLevel` context no longer consumed by detail content components
- **Refactor scope:** Only PilotLevel1/2/3 need refactoring (already implemented). AtcLevel, CtrLevel, AirportAtcLevel components were never created.
- **No infrastructure changes:** DetailPanelProvider, sheet snap points, animations all unchanged mechanically.

---

## Section 3: Recommended Approach

**Selected Path:** Option 1 — Direct Adjustment

1. Insert Story 4.2.1 to refactor the existing pilot detail from 3 components to 1 `PilotDetailCard`
2. Update Stories 4.3, 4.4 acceptance criteria to follow single-card pattern from the start
3. Update Story 7.2 to reference single card components
4. Update PRD, Architecture, and UX spec to reflect the new model

**Rationale:**
- **Simplification, not added complexity** — fewer components, less conditional logic, smaller bug surface
- **Identical UX outcome** — users see the same content in the same order at the same snap points
- **Optimal timing** — only 4.2 needs refactoring; 4.3 and 4.4 benefit from starting fresh with the simpler pattern
- **Low risk** — the sheet mechanics are unchanged; only the content rendering approach simplifies
- **Effort: Low** — refactoring 3 existing components into 1, updating 3 unstarted stories
- **Risk: Low** — simplification with validated sheet infrastructure

---

## Section 4: Detailed Change Proposals

### 4.1 PRD Changes

**FR9** (reworded): User can view glanceable summary information for any selected client at the bottom sheet peek position without additional interaction

**FR10** (reworded): User can swipe up to reveal moderate detail for a selected client at the half-sheet position

**FR11** (reworded): User can swipe to full-sheet position to view complete detail for a selected client, including flight plan, ATIS text, or full ATC info

**FR11a** (new): Each detail type (pilot, ATC, airport) renders a single complete card with content ordered by priority; the bottom sheet snap points control how much of the card is physically visible

### 4.2 Architecture Changes

- Replace "Progressive disclosure uses additive content rendering: Level 1 always shown, Level 2 adds, Level 3 adds" → single complete card per detail type with content ordered by information priority; sheet snap points control physical visibility
- Replace "15 new Level sub-components" → "5 new detail card components (1 per detail type)"

### 4.3 UX Spec Changes

- DetailSheet interaction flow: reframe from "Level 1/2/3" language to "card top / more of card / complete card" revealed by snap points
- Component table: replace `ClientCard` with specific detail card components (`PilotDetailCard`, `AtcDetailCard`, etc.)
- Disclosure patterns: "single complete detail card" instead of "three-level sheet disclosure"
- Migration table: "Single complete detail card" instead of "Three-level progressive disclosure"
- Spacing rule: consistent rhythm throughout card instead of increasing spacing per level

### 4.4 Epic Changes

- **Story 4.2**: Title changed to "Single Complete Card". Acceptance criteria updated to remove Level sub-component references.
- **Story 4.2.1** (NEW): "Refactor Pilot Detail from Three-Level Components to Single Card" — consolidate PilotLevel1/2/3 into PilotDetailCard, validate pattern on both platforms.
- **Story 4.3**: Title changed to "Single Complete Cards". AtcDetailCard and CtrDetailCard instead of 6 level components.
- **Story 4.4**: Title changed to "Single Complete Card". AirportDetailCard instead of 3 level components.
- **Story 7.2**: SidePanel renders same single card components with scroll.

---

## Section 5: Implementation Handoff

**Change Scope Classification:** Minor — direct implementation by development team.

**Implementation Sequence:**
1. Update planning artifacts (PRD, Architecture, UX Spec, Epics) with approved changes
2. Implement Story 4.2.1 — refactor pilot detail, validate on both platforms
3. Proceed to Story 4.3 using single-card pattern
4. Proceed to Story 4.4 using single-card pattern

**Success Criteria:**
- PilotDetailCard renders identical visual output to the previous Level1+Level2+Level3 at each snap point
- PilotLevel1Summary.jsx, PilotLevel2Details.jsx, PilotLevel3Full.jsx are removed
- 4.3 and 4.4 each produce a single card component (not 3 level components)
- Manual testing on iOS and Android confirms correct content visibility at each snap point
