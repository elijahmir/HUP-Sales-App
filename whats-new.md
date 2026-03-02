# What's New

## 🚀 OFFERS SYSTEM UPGRADES (March 2026)

- **Smart Solicitor Auto-Fill**: Selecting a solicitor firm now dynamically split-fills the exact firm and agent names—no more double typing!
- **Smarter Conditional Dates**: The "Subject to Sale" expected completion date is now a native, user-friendly calendar date picker.
- **Flawless Offer Syncing**: Squashed a pesky duplicate-entry bug! Submitting an offer directly from a dashboard draft now flawlessly updates the record without creating clones.
- **Frictionless Appendix Downloads**: Those long appendix filenames in the Offer Details will no longer break the modal UI, and they are now one-click functional download buttons.
- **Perfected Automations**: Re-mapped the Purchaser payload structure under-the-hood to securely match Vendor payloads for bulletproof n8n automations.
- **Refined Copy**: Softened the instructional banner wording to remove the aggressive push for a "best and final" offer.

## 🤖 SUPERCHARGED AI OCR (Feb 2026)

The app now runs on **Google Gemini 2.0 Flash**, delivering human-level handwriting recognition:

- **Writes Like a Pro**: Extracts messy, cursive, and slanted handwriting with incredible accuracy.
- **Improved Field Detection**: Smarter extraction of 'Method of Sale', Vendor Names, and complex Addresses.
- **Thinking Process**: Watch the AI analyze your document in real-time with the new "Processing Thought" stream.

## 🔄 INTELLIGENT DUPLICATE HANDLING

We've overhauled how the app interacts with VaultRE to keep your database clean:

- **Update vs. Create**: If a property already exists, you can now **UPDATE** it with the new appraisal data instead of creating a duplicate.
- **Precision Matching**: The app now finds specific units (e.g., `1/568`) even when VaultRE's search misses them. No more false duplicates for Unit 1 vs. House 1.
- **Detailed Preview**: Review existing property details (Status, Agent, Price) before syncing to ensure you're updating the right record.

## ✨ POLISHED EXPERIENCE

- **AI Assistant Badge**: A new visual indicator for AI-processed appraisals.
- **Automatic Reset**: Form clears automatically after successful submission for rapid-fire processing.
- **Smart Loading**: Cleaner loading states and error messages during synchronization.
