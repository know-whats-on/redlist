# IUCN Regional/National Red List Assessment Trainer & Drafting PWA

A comprehensive, mobile-first Progressive Web Application for training new assessors and drafting IUCN-compliant regional/national Red List assessments.

## Features

### ✅ Complete 3-Step Assessment Workflow
- **Step 1: Eligibility & Filtering** - Implements Annex 3 logic with vagrant detection, native population verification, and breeding/visiting population classification
- **Step 2: Preliminary Category** - IUCN Criteria A-E evaluation using regional population data with automated category calculation
- **Step 3: Adjustment** - Rescue effect and sink population logic for extra-regional influence assessment

### 📱 Mobile-First Design
- Optimized for field use on smartphones and tablets
- Thumb-friendly navigation with bottom tab bar
- Safe-area support for notched devices
- Large touch targets (minimum 44px)
- Offline-capable with localStorage persistence

### 🎓 Educational Features
- Interactive 3-step onboarding with guided mock assessment
- Comprehensive glossary with IUCN terminology
- Built-in help center with "How To" guides and troubleshooting
- Inline tooltips and contextual guidance throughout

### 📊 IUCN-Compliant Logic
- Mandatory 3-step regional assessment process
- Separation of extinction risk from conservation priority
- Regional data validation (prevents global data use in Step 2)
- Category adjustment tracking with degree symbol (°) notation
- Confidence scoring based on data completeness

### 💾 Offline Capabilities
- Full assessment workflow works without internet
- Auto-save every field change
- Online/offline status indicator
- Local data persistence with localStorage

### 📤 Export Options
- JSON (complete data export)
- CSV (Red List table format)
- PDF report (full narrative - placeholder)
- Includes audit trail and metadata

### 🔍 Data Management
- Taxa library with regional/global category tracking
- Evidence repository (placeholder for attachments)
- Assessment history with draft/review status
- Quick stats dashboard

## Key Compliance Features

✓ Implements IUCN Regional/National Guidelines without deviation  
✓ Enforces "Red List ≠ Conservation Priority" separation  
✓ Blocks vagrant assessments (must be NA)  
✓ Requires regional-only data in Step 2  
✓ Documents all category adjustments with rationale  
✓ Supports breeding/visiting population workflows  
✓ Includes RE and NA regional category additions  

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **localStorage** - Offline data persistence
- **Lucide React** - Icon library

## Getting Started

The app is ready to use immediately. On first launch:

1. **Onboarding Step 1**: Create account and enable offline storage
2. **Onboarding Step 2**: Select your assessment region
3. **Onboarding Step 3**: Complete a guided mock assessment

After onboarding, you can:
- Create new assessments from the Home dashboard
- Continue draft assessments
- Access the Help Center for guidance
- Export completed assessments

## Assessment Workflow

### Step 1: Eligibility & Filtering
- Verify native or benign introduction status
- Check for vagrant occurrence (blocks assessment if true)
- Identify breeding and/or visiting populations
- Document eligibility decision with evidence

### Step 2: Preliminary Category
- Enter regional population data:
  - Population size (mature individuals)
  - Population trend and decline percentage
  - Extent of Occurrence (EOO)
  - Area of Occupancy (AOO)
  - Number of locations
  - Fragmentation status
  - Threats and habitat status
- Automatic IUCN Criteria A-E evaluation
- Confidence score calculation

### Step 3: Adjustment
- Assess immigration likelihood (rescue effect)
- Evaluate source population stability
- Check for sink population dynamics
- Document adjustment rationale
- Final category with ° marker (if adjusted)

### Output
- Final regional category display
- Confidence score with drivers
- Plain-language rationale
- Export options (JSON, CSV, PDF)
- What-to-do-next guidance
- Missing data checklist

## Guardrails & Validation

- **Vagrant blocking**: Prevents assessment of vagrant occurrences
- **Regional data enforcement**: Step 2 requires regional-only data inputs
- **Adjustment constraints**: Categories EX, EW, DD, NA, NE, RE cannot be adjusted
- **Rationale requirements**: Adjustments require thorough documentation
- **Confidence transparency**: Shows data quality and completeness drivers

## Mobile Optimization

- **Responsive design**: Works on devices from 320px to tablets
- **Safe areas**: Proper padding for iOS notches and Android gestures
- **Touch-friendly**: All interactive elements ≥44px tap targets
- **No zoom**: Input fields use 16px font to prevent iOS auto-zoom
- **Offline-first**: Full functionality without internet connection

## Data Storage

All data is stored locally on your device using localStorage:
- Assessment drafts
- User preferences
- Region configuration
- Onboarding completion status

**Export your data regularly** to back up assessments.

## Important Notes

⚠️ **Best-Estimate Classification**: This app provides estimated classifications based on input data. All assessments require expert review before publication.

⚠️ **Not for PII**: Figma Make is not designed for collecting Personally Identifiable Information or securing sensitive data.

⚠️ **Compliance Requirement**: To claim IUCN-system compliance, regional authorities must follow the Regional/National Guidelines without deviation or modification.

⚠️ **Not a Priority Tool**: This app measures extinction risk, NOT conservation priority. These are separate processes.

## Future Enhancements

Potential features for production deployment:
- Server-side data sync with conflict resolution
- Multi-user collaboration and review workflows
- Evidence file uploads (images, PDFs, shapefiles)
- Real PDF generation with full narrative
- Integration with global IUCN Red List API
- Advanced criteria calculator with subspecies support
- Bulk import from spreadsheets
- Regional authority admin dashboard

## Glossary Quick Reference

- **Region**: Any subglobal area (country, state, province, etc.)
- **Regional Population**: The portion of a taxon's global population within regional boundaries
- **Rescue Effect**: Immigration reducing regional extinction risk (typically downlists)
- **Sink Population**: Population dependent on immigration to persist
- **Visitor**: Non-breeding population present seasonally
- **Vagrant**: Occasional/unpredictable occurrence (NOT assessed)
- **NA**: Not Applicable (introduced, vagrant, filtered)
- **RE**: Regionally Extinct (extinct in region but extant globally)

## Support

For help with the assessment process:
1. Check the **Help Center** (Help tab in bottom navigation)
2. Review the **Glossary** for term definitions
3. Consult the **Troubleshooting** section for common issues
4. Refer to official IUCN Regional/National Guidelines

## License

This is an educational prototype implementing IUCN Red List methodology. 
The IUCN Red List Categories and Criteria are © IUCN.

---

**Built with Figma Make** - A fully functioning web application powered by React and Tailwind CSS.
