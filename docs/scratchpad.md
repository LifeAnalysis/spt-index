
### [2025-11-26] Documentation Cleanup
**Context:** User requested deletion of obsolete markdown files to reduce clutter.

**Action:** Deleted the following files which were serving as temporary status updates or completion markers:
- Root: `DEPLOYMENT_COMPLETE.md`, `DEPLOYMENT_STATUS.md`, `DEPLOYMENT.md`, `FINAL_DEPLOYMENT_SUMMARY.md`, `IMPLEMENTATION_SUMMARY.md`, `METRIC_SYSTEM_UPDATE.md`, `VISUAL_CHANGES_GUIDE.md`
- Docs: `docs/MOBILE_OPTIMIZATION_SUMMARY.md`, `docs/PROTOCOL_PAGE_MOBILE_FIXES_COMPLETE.md`, `docs/PROTOCOL_PAGE_MOBILE_FIXES.md`

**Outcome:** Project root and docs folder are now cleaner, containing only essential documentation (`product.md`, `ROADMAP.md`, `CHANGELOG.md`, `scratchpad.md`) and implementation plans.

---

### [2025-11-26] Typography and Content Improvements
**Context:** User requested removal of em dashes (—) throughout the website and addition of CDP protocol methodology to the about page.

**Action:**
1. **Removed all em dashes** from the website, replacing them with:
   - Periods and separate sentences for better readability
   - Colons where appropriate
   - "because" or "so" for causal relationships
   
   Files updated:
   - `frontend/app/about/page.tsx` (7 instances)
   - `frontend/app/page.tsx` (2 instances)
   - `frontend/app/protocol/[slug]/page.tsx` (1 instance in tooltip)
   - `frontend/app/layout.tsx` (1 instance in meta description)

2. **Added CDP Protocol methodology** to the about page:
   - Created new methodology card for CDP/Stablecoin protocols
   - Weights: Minted Stablecoin (40%), Blue-chip Collateral (30%), Utilization Rate (20%), Stability Fees (10%)
   - Changed grid layout from 2 columns to 3 columns to accommodate DEX, Lending, and CDP methodologies
   - Used purple theme for CDP card to distinguish from DEX (blue) and Lending (green)

**Outcome:** 
- More professional, readable text throughout the site
- Complete methodology documentation now covers all three protocol types
- Consistent visual hierarchy with the three-column methodology grid
