**Subject:** HUP Sales App — Security Update & System Improvements (21 April 2026)

---

Hi team,

We've pushed an important update to the HUP Sales App today. Here's what changed and what it means for you.

---

## 🛡️ Security Hardening (Critical)

We closed two security gaps in the system that powers the HUP Sales App and related Harcourts platforms:

**1. Admin access can no longer be self-granted**

Previously, any logged-in user could edit their own account in a way that promoted themselves to administrator — giving them access to sensitive data and restricted features. This has been fixed. Admin roles are now assigned exclusively by the technical team through secure, server-controlled processes. No user can alter their own permission level.

All existing admins remain unaffected — your access is exactly as it was.

**2. Sensitive data is no longer publicly readable**

The database previously allowed certain information (user profiles, revenue analytics, platform settings) to be accessed by unauthenticated connections. This window has been closed. That data now requires a valid login before it can be accessed.

---

## ✅ App Quality Improvements

Alongside the security work, we completed a full technical audit of the app:

- **Zero build errors or warnings** — the app now compiles cleanly with no issues flagged
- **Verified nothing was broken** — all features (SAA signing, expense approvals, vendor offer reports, property selector) were checked and confirmed working correctly
- **Code pushed to the main branch** — ready for deployment or further review

---

## 👤 Action Required

| Who | What to do |
|---|---|
| **Regular users** | Nothing — your experience is unchanged |
| **Admins** | If your session feels different, simply sign out and sign back in. Your admin access is fully intact. |
| **Other developers** | If you build apps on the same database, see `security-update.md` for a full technical migration guide |

---

**Status:** ✅ Complete — production-ready  
**Deployed:** 21 April 2026  
**Prepared by:** Elijah Mirandilla

---

*Questions? Reply to this email or reach out directly.*
