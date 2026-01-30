# What's New

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
