# What's New

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

## 🚀 VaultRE Integration Enhancements

We've significantly improved the reliability and accuracy of the appraisal creation process.

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
