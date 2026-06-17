# Email — Property Missing Fix (Steph)

**To:** Steph
**From:** Eli
**Subject:** Fixed — 73b Jones Road, Miena (and all other listings) now showing in the offer form

---

Hi Steph,

Thanks for flagging this — you were right that it wasn't the agency date, and it turned out to be a good catch that was affecting more than just the one property.

**What was happening**

The offer form pulls our live listings straight from Vault, but it was only loading the **first 100 properties**. We currently have **213** active listings on the market, so anything past the first 100 simply never appeared in the picker.

Vault hands the properties back in "most recently edited" order, and **73b Jones Road, Miena** was sitting at roughly position 112 — just outside that 100 cut-off — which is why it went missing even though it was a perfectly valid, in-agency listing. Any listing that hadn't been edited recently was at risk of the same thing.

**What I've done**

I've changed the form so it now loads **every** active listing/conditional property, not just the first 100. I tested it against our live Vault data and confirmed:

- All **213** properties now come through (was capped at 100).
- **73b Jones Road, Miena now shows up** and can be selected for an offer.

**Will it happen again?**

No — the form now automatically loads through all pages of listings however many we have, so the list will always be complete. I've also built in a safeguard so that if Vault ever has a hiccup, the form will show an error rather than quietly leaving properties out (which is what made this hard to spot).

This is going through final review now and will be live shortly. You should be able to put that offer through on 73b Jones Road as soon as it's deployed — I'll let you know the moment it's up.

Thanks again for the detailed report, it made this much quicker to track down.

Cheers,
Eli
