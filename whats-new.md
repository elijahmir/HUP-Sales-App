# What's New

## 📐 Room Dimension Inputs (Feb 2026)

Enhanced the Front Sheet form to **exactly match the printed Harcourts form** with room dimension inputs:

- **Bedrooms 1-5**: BI/WI radio buttons + `[width] x [height]` dimension inputs
- **Ensuite**: Dimension inputs with SOB/Sep Shower/Bath options
- **Kitchen to Laundry**: All rooms now have X checkbox + dimension fields
- **OCR Intelligence**: Automatically parses handwritten dimensions (e.g., "4x5") into separate `size_width` and `size_height` fields

## 🧪 Ready for Testing

**Core features are now integrated and require user validation.** Please focus testing on:

1. SAA Form rendering and pre-filling.
2. New appraisal creation flow (Duplicate vs New).
3. HEIC image uploads.

## 📝 SAA Digital Form Integration

The **SAA Digital Form** is now fully included inside the HUP Sales App.

- **Seamless Loading**: Form payload is strictly parity-matched with the reference implementation.
- **Value Logic**: Verified `file_name`, vendors, and commission calculations.

## 🤖 Intelligent Appraisal Routing

We've upgraded the "Create Appraisal" workflow to be smarter about existing data:

- **Duplicate Detection**: The system now checks if a property already exists in VaultRE.
- **Smart Handling**:
  - **Existing**: Updates or links to the existing record.
  - **New**: Automatically pushes to VaultRE and sets status to 'Appraisal'.

## 📱 HEIC Support & System Hardening

We've improved compatibility for mobile users and significantly hardened the system's security and stability.

### 🍏 HEIC Image Support

- **iPhone Compatibility**: Now supports direct upload of `.heic` and `.heif` images (Live Photos/iPhone standard format).
- **Auto-Conversion**: Automatically converts HEIC to high-quality JPEG on the fly during upload.

### 🧠 OCR Stability & Reliability

- **Smart Timeout**: Added a 90-second safety valve to prevent the "Generating Digital Twin" process from hanging indefinitely.
- **Robust Parsing**: Enhanced the AI response handler to intelligently ignore markdown formatting, resolving the "stuck" analysis issue.

### 🛡️ Security & Performance

- **Production Headers**: Implemented strict security headers (HSTS, X-Frame-Options, X-Content-Type-Options) for production deployments.
- **Repository Cleanup**: Removed over 20 unused development scripts to keep the codebase clean and secure.
- **Build Optimization**: Resolved Next.js build warnings for a smoother deployment pipeline.

## ⚙️ Under-the-Hood Enhancements

We've improved the reliability of the underlying VaultRE integration logic.

### 🔍 Robust Duplicate Detection

- **Strict Logic Parity**: Duplicate checking now mirrors the n8n workflow logic exactly.
- **Smart Parsing**: Addresses are parsed into Number, Street Name, and Unit for precise comparison.
- **Garbage Collection**: Street names are sanitized (lowercase, alphanumeric only) to prevent "Moonbeam Place" vs "Moonbeam Pl" mismatches.

### 🏘️ Fixed Suburb Search

- **Correct Endpoint**: Switched to the `/suggest/suburb` endpoint to correctly handle suburbs like "Ulverstone".
- **No More Blanks**: Resolved the "Suburb is blank" error by ensuring the correct Suburb ID is always retrieved.

### 🛠️ Other Improvements

- **Agent Validation**: Dropdown now strictly validates against the authorized agent list.
- **Error Handling**: Enhanced error messages provided for any VaultRE API failures.
