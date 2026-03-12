/**
 * Offer Confirmation Email — HTML Builder
 * Generates a branded Harcourts HTML email for offer confirmation.
 *
 * Branding tokens (from Harcourts Branding JSON):
 *   Primary:    #00ADEF
 *   Navy/Accent: #001F49
 *   Background: #FFFFFF
 *   Font:       Source Sans Pro, Arial, sans-serif
 *   Logo:       HUP Stacked White logo
 */

import type { ContactStaffInfo } from "./types";

// ─── Constants ───────────────────────────────────────────────────
const LOGO_URL = `${process.env.NEXT_PUBLIC_APP_URL || "https://salesapp.hup.net.au"}/hup-logo-white.png`;
const PRIMARY = "#00ADEF";
const NAVY = "#001F49";
const GRAY_BG = "#F8FAFC";
const GRAY_BORDER = "#E2E8F0";
const GRAY_TEXT = "#64748B";
const WHITE = "#FFFFFF";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://salesapp.hup.net.au";
const CONFIRMATION_WEBHOOK = "https://hup.app.n8n.cloud/webhook/offer-confirmation";

// ─── Types ───────────────────────────────────────────────────────
interface ConfirmationEmailData {
  submissionId: string;
  purchaserName: string;
  purchaserEmail: string;
  isRepresentedByBuyersAgent?: boolean;
  buyersAgentName?: string;
  propertyAddress: string;
  offerPrice: string;
  depositAmount: string;
  financeRequired: boolean;
  settlementPeriod: string;
  agents: ContactStaffInfo[];
}

// ─── HTML Builder ────────────────────────────────────────────────
export function buildConfirmationEmailHTML(data: ConfirmationEmailData): string {
  const editUrl = `${BASE_URL}/offer/edit/${data.submissionId}`;
  const financeText = data.financeRequired ? "Yes" : "Cash (No Finance)";

  let firstName = data.purchaserName.split(" ")[0] || data.purchaserName;
  let contextLine = "We&rsquo;ve received your details and our team will review everything shortly. Below is a summary of your submission.";

  if (data.isRepresentedByBuyersAgent && data.buyersAgentName) {
    firstName = data.buyersAgentName.split(" ")[0] || data.buyersAgentName;
    contextLine = `We&rsquo;ve received the offer you submitted on behalf of <strong>${escapeHtml(data.purchaserName)}</strong>. Our team will review everything shortly. Below is a summary of the submission.`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offer Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:${GRAY_BG};font-family:'Source Sans Pro',Arial,Helvetica,sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${GRAY_BG};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${WHITE};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${NAVY} 0%, #002D6B 100%);padding:32px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Harcourts Ulverstone & Penguin" width="220" style="display:block;margin:0 auto 20px;max-width:220px;height:auto;" />
              <h1 style="margin:0;color:${WHITE};font-size:22px;font-weight:700;letter-spacing:0.5px;">Offer Confirmation</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <!-- Greeting -->
              <p style="margin:0 0 16px;color:${NAVY};font-size:18px;font-weight:700;">
                Hi ${escapeHtml(firstName)},
              </p>
              <p style="margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">
                ${contextLine}
              </p>

              <!-- Offer Summary Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${GRAY_BG};border:1px solid ${GRAY_BORDER};border-radius:8px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px 12px;">
                    <p style="margin:0 0 4px;color:${GRAY_TEXT};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Property</p>
                    <p style="margin:0;color:${NAVY};font-size:16px;font-weight:700;">${escapeHtml(data.propertyAddress)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px;">
                    <hr style="border:none;border-top:1px solid ${GRAY_BORDER};margin:12px 0;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding:8px 0;">
                          <p style="margin:0;color:${GRAY_TEXT};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Offer Price</p>
                          <p style="margin:4px 0 0;color:${NAVY};font-size:20px;font-weight:700;">$${escapeHtml(data.offerPrice)}</p>
                        </td>
                        <td width="50%" style="padding:8px 0;">
                          <p style="margin:0;color:${GRAY_TEXT};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Deposit</p>
                          <p style="margin:4px 0 0;color:${NAVY};font-size:20px;font-weight:700;">$${escapeHtml(data.depositAmount || "—")}</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:8px 0;">
                          <p style="margin:0;color:${GRAY_TEXT};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Finance</p>
                          <p style="margin:4px 0 0;color:#334155;font-size:14px;font-weight:600;">${financeText}</p>
                        </td>
                        <td width="50%" style="padding:8px 0;">
                          <p style="margin:0;color:${GRAY_TEXT};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Settlement</p>
                          <p style="margin:4px 0 0;color:#334155;font-size:14px;font-weight:600;">${escapeHtml(data.settlementPeriod || "—")}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td align="center" style="border-radius:8px;background-color:${PRIMARY};">
                          <a href="${editUrl}" target="_blank" style="display:inline-block;background-color:${PRIMARY};color:${WHITE};font-family:'Source Sans Pro',Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;letter-spacing:0.3px;border:1px solid ${PRIMARY};">
                            View &amp; Edit Your Offer
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <p style="margin:0;color:${GRAY_TEXT};font-size:12px;">
                      Click the button above to review or make changes to your offer.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F9FF;border-left:4px solid ${PRIMARY};border-radius:0 8px 8px 0;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;color:${NAVY};font-size:14px;font-weight:700;">What happens next?</p>
                    <p style="margin:0;color:#334155;font-size:13px;line-height:1.6;">
                      Our agent will review your offer and present it to the vendor. We&rsquo;ll be in touch with you to discuss the next steps. If you need to make any changes, use the button above.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${NAVY};padding:28px 40px;text-align:center;">
              <img src="${LOGO_URL}" alt="Harcourts Ulverstone & Penguin" width="160" style="display:block;margin:0 auto 16px;max-width:160px;height:auto;" />
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.15);margin:12px 0;" />
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;line-height:1.5;">
                This is an automated confirmation email. Please do not reply directly to this email.
                <br />For enquiries, contact your property agent.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Helpers ─────────────────────────────────────────────────────
function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Send Confirmation Email ────────────────────────────────────
export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const body = buildConfirmationEmailHTML(data);
    const subject = `Offer Confirmation — ${data.propertyAddress}`;

    // Build CC list from property agents
    const ccList = data.agents
      .map((a) => a.email)
      .filter((email): email is string => !!email && email.length > 0)
      .join(", ");

    const webhookPayload = {
      email: data.purchaserEmail,
      subject,
      cc: ccList,
      body,
    };

    const res = await fetch(CONFIRMATION_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Confirmation email webhook failed:", res.status, errText);
      return { success: false, error: `Webhook ${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error("Confirmation email error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
