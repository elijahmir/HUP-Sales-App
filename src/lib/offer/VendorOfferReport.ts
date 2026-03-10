import jsPDF from "jspdf";

// ─── Types ───────────────────────────────────────────────────────
interface AgentInfo {
    firstName?: string;
    lastName?: string;
    position?: string;
    photoUrl?: string;
    mobile?: string;
}

interface OfferData {
    purchaserName: string;
    purchaserEmail?: string;
    structure: string;
    offerPrice: number;
    deposit: number;
    financeRequired: boolean;
    settlementPeriod?: string;
    coolingOffPeriod?: boolean;
    buildingInspection?: boolean;
    subjectToSale?: boolean;
    specialClauses?: string;
    bankLender?: string;
    financeAmount?: string;
    createdAt?: string;
}

interface ReportData {
    propertyAddress: string;
    propertySuburb: string;
    propertyState: string;
    propertyImage: string;
    bed: number | null;
    bath: number | null;
    garages: number | null;
    totalOffers: number;
    highestOffer: number;
    avgOffer: number;
    agents: AgentInfo[];
    offers: OfferData[];
}

// ─── Helpers ─────────────────────────────────────────────────────

function formatPrice(num: number): string {
    return num.toLocaleString("en-AU", { maximumFractionDigits: 0 });
}

function getExactWidth(doc: jsPDF, text: string): number {
    return (doc.getStringUnitWidth(text) * doc.getFontSize()) / doc.internal.scaleFactor;
}

function printTruncated(doc: jsPDF, text: string, x: number, y: number, maxW: number, options?: any) {
    if (!text) return;
    const w = getExactWidth(doc, text);
    if (w <= maxW) {
        doc.text(text, x, y, options);
        return;
    }
    const ellipsis = "...";
    const ew = getExactWidth(doc, ellipsis);
    let str = text;
    while (str.length > 0 && getExactWidth(doc, str) + ew > maxW) {
        str = str.slice(0, -1);
    }
    doc.text(str + ellipsis, x, y, options);
}

function toInitials(name: string): string {
    if (!name) return "";
    const clean = name.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
    if (!clean) return "";
    let parts = clean.split(/\s+/);
    if (parts.length > 4) parts = parts.slice(0, 4);
    return parts.map((n) => n[0].toUpperCase() + ".").join("");
}

function toTitleCase(str: string): string {
    if (!str) return "";
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
}

// Dedicated proxy route for local downloading that bypasses bucket CORS blockages entirely
async function loadImageAsBase64(url: string, originProxy: boolean = false): Promise<string | null> {
    if (!url) return null;
    try {
        const fetchUrl = originProxy
            ? `/api/proxy-image?url=${encodeURIComponent(url)}` // Secure local bypass
            : url;

        const res = await fetch(fetchUrl, { cache: "no-store" });
        if (!res.ok) return null;
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

// ─── Colors ──────────────────────────────────────────────────────
const NAVY = [0, 31, 73] as const;       // #001F49
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BLUE = [0, 166, 206] as const;     // #00A6CE
const GRAY600 = [75, 85, 99] as const;
const GRAY500 = [107, 114, 128] as const;
const GRAY400 = [156, 163, 175] as const;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GRAY300 = [209, 213, 219] as const;
const GRAY200 = [229, 231, 235] as const;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const WHITE = [255, 255, 255] as const;
const GREEN = [16, 185, 129] as const;
const AMBER = [245, 158, 11] as const;
const BG_LIGHT = [249, 250, 251] as const;

// ─── Main Export ─────────────────────────────────────────────────
export async function generateVendorOfferReport(data: ReportData): Promise<void> {
    // 1. SWITCH TO LANDSCAPE A4
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = 297; // A4 Landscape width
    const pageH = 210; // A4 Landscape height
    const marginL = 15;
    const marginR = 15;
    const contentW = pageW - marginL - marginR;

    // 2. Pre-load images (Utilizing new highly secure local bypass proxy for property/agent images if they look like remote URLs)
    const [logoBase64, propertyImgBase64, ...agentPhotos] = await Promise.all([
        loadImageAsBase64("/harcourts-logo.png", false), // local file, no proxy needed
        data.propertyImage ? loadImageAsBase64(data.propertyImage, data.propertyImage.startsWith("http")) : Promise.resolve(null),
        ...data.agents.slice(0, 2).map((a) =>
            a.photoUrl ? loadImageAsBase64(a.photoUrl, a.photoUrl.startsWith("http")) : Promise.resolve(null)
        ),
    ]);

    let y = 15; // Starting position for header

    // ── HEADER ──────────────────────────────────────────────────
    // Logo (left) 
    if (logoBase64) {
        try {
            const props = doc.getImageProperties(logoBase64);
            const ratio = props.width / props.height;
            // The header logo is heavily scaled to match the visual weight of the Vendor Offer Report title
            const h = 45;
            const w = h * ratio;
            doc.addImage(logoBase64, "PNG", marginL, y - 6, w, h);
        } catch {
            console.error("Failed to draw logo");
        }
    }

    // Agent info (right)
    const agentsSlice = data.agents.slice(0, 2);
    if (agentsSlice.length > 0) {
        const agentBlockX = pageW - marginR;
        const agentY = y + 2;

        const names = agentsSlice.map(a => `${a.firstName || ""} ${a.lastName || ""}`.trim()).join("   |   ");
        const roles = agentsSlice.map(a => a.position || "").join("   |   ");
        const mobiles = agentsSlice.map(a => a.mobile || "").join("  |  ");

        // Use larger photo block on landscape
        const photoSize = 18;
        const hasPhotos = agentPhotos.some(p => p !== null);
        let textRightEdge = agentBlockX;

        // Draw photos on far right
        let photoX = agentBlockX - photoSize;
        if (hasPhotos) {
            textRightEdge = photoX - 5;
            for (let i = agentsSlice.length - 1; i >= 0; i--) {
                const photo = agentPhotos[i];
                if (photo) {
                    doc.setFillColor(...GRAY200);
                    doc.roundedRect(photoX, agentY, photoSize, photoSize, 2, 2, "F");
                    try {
                        doc.addImage(photo, "JPEG", photoX, agentY, photoSize, photoSize);
                    } catch { } // Swallow error if corrupted
                    photoX -= photoSize + 4;
                }
            }
            if (photoX < agentBlockX - photoSize) {
                textRightEdge = photoX + photoSize - 2;
            }
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...NAVY);
        doc.text(names, textRightEdge, agentY + 3, { align: "right" });

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY500);
        doc.text(roles, textRightEdge, agentY + 7, { align: "right" });

        if (mobiles.replace(/[^0-9]/g, "").length > 0) {
            doc.text(mobiles, textRightEdge, agentY + 11, { align: "right" });
        }
    }

    y += 38; // Pushed down to accommodate the massive logo expansion

    // ── TITLE ───────────────────────────────────────────────────
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text("Vendor Offer Report", marginL, y);
    y += 10;

    // ── PROPERTY CARD ───────────────────────────────────────────
    const cardH = 34;
    doc.setFillColor(...BG_LIGHT);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginL, y, contentW, cardH, 4, 4, "FD");

    // Property image
    const imgW = 32;
    const imgH = 26;
    const imgX = marginL + 4;
    const imgY = y + 4;

    doc.setFillColor(...GRAY200);
    doc.roundedRect(imgX, imgY, imgW, imgH, 2, 2, "F"); // Placeholder box
    if (propertyImgBase64) {
        try {
            doc.addImage(propertyImgBase64, "JPEG", imgX, imgY, imgW, imgH);
        } catch { }
    }

    // Property text
    const propTextX = imgX + imgW + 6;
    doc.setFontSize(13); // Increased font size
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);

    // TRUNCATE Property Address strictly leaving 90mm space for stats so it NEVER overlaps
    const statsStartLeft = pageW - marginR - 100; // Left more room for enlarged stats
    const maxAddressWidth = statsStartLeft - propTextX - 5;
    printTruncated(doc, toTitleCase(data.propertyAddress), propTextX, y + 12, maxAddressWidth);

    doc.setFontSize(9); // Increased font size
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);

    const featuresArr = [];
    if (data.bed != null) featuresArr.push(`${data.bed} BED`);
    if (data.bath != null) featuresArr.push(`${data.bath} BATH`);
    if (data.garages != null) featuresArr.push(`${data.garages} CAR`);

    const suburbState = toTitleCase(`${data.propertySuburb} ${data.propertyState}`.trim());
    let featuresText = suburbState;
    if (featuresArr.length > 0) {
        featuresText += `    ${featuresArr.join("   ")}`;
    }
    printTruncated(doc, featuresText, propTextX, y + 18, maxAddressWidth);

    // Stats (right side)
    const rightEdge = marginL + contentW - 5; // Right buffer inside grey box

    // Generous right align positions across extended landscape width
    const avgX = rightEdge;
    const highestX = avgX - 25;
    const offersX = highestX - 25;

    doc.setFontSize(9); // Increased font size
    doc.setTextColor(...GRAY400);
    doc.text("Avg", avgX, y + 11, { align: "right" });
    doc.text("Highest", highestX, y + 11, { align: "right" });
    doc.text("Offers", offersX, y + 11, { align: "right" });

    doc.setFontSize(14); // Increased font size
    doc.setFont("helvetica", "bold");

    doc.setTextColor(...GRAY600);
    doc.text(`$${formatPrice(data.avgOffer)}`, avgX, y + 19, { align: "right" });

    doc.setTextColor(...GREEN);
    doc.text(`$${formatPrice(data.highestOffer)}`, highestX, y + 19, { align: "right" });

    doc.setTextColor(...NAVY);
    doc.text(String(data.totalOffers), offersX, y + 19, { align: "right" });

    y += cardH + 10;

    // ── OFFERS TABLE ────────────────────────────────────────────
    const sortedOffers = [...data.offers].sort((a, b) => b.offerPrice - a.offerPrice);

    // Landscape Columns Allocation (contentW is 267)
    const cols = {
        purchaser: { x: marginL + 5, w: contentW * 0.30 },
        structure: { x: marginL + 5 + (contentW * 0.30), w: contentW * 0.20 },
        price: { x: marginL + 5 + (contentW * 0.50), w: contentW * 0.20 },
        deposit: { x: marginL + 5 + (contentW * 0.70), w: contentW * 0.15 },
        finance: { x: marginL + 5 + (contentW * 0.85), w: contentW * 0.15 },
    };

    const rowHeight = 16; // Taller row to accommodate Purchaser Name & Email vertically
    const headerHeight = 10;
    let tableStartY = y;

    // Header
    const drawTableHeader = (startY: number) => {
        doc.setFillColor(248, 250, 252);
        // Rounded at top corners
        doc.roundedRect(marginL, startY, contentW, headerHeight, 4, 4, "F");
        // Flat at bottom corners to meet rows seamlessly
        doc.rect(marginL, startY + 4, contentW, headerHeight - 4, "F");

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...GRAY600);

        const ty = startY + 6.5;
        doc.text("Purchaser", cols.purchaser.x, ty);
        doc.text("Structure", cols.structure.x, ty);
        doc.text("Offer Price", cols.price.x, ty);
        doc.text("Deposit", cols.deposit.x, ty);
        doc.text("Finance", cols.finance.x, ty);

        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(marginL, startY + headerHeight, marginL + contentW, startY + headerHeight);

        return startY + headerHeight;
    };

    let pageNum = 1;
    y = drawTableHeader(y);

    // Rows
    for (let i = 0; i < sortedOffers.length; i++) {
        const offer = sortedOffers[i];
        const isHighest = i === 0;

        // Page break
        if (y + rowHeight > pageH - 25) {
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.5);
            doc.roundedRect(marginL, tableStartY, contentW, y - tableStartY, 4, 4);

            doc.addPage();
            pageNum++;
            y = 15;
            tableStartY = y;
            y = drawTableHeader(y);
        }

        if (isHighest) {
            doc.setFillColor(236, 253, 245);

            if (i === sortedOffers.length - 1) { // Lowest row on the table
                doc.roundedRect(marginL, y, contentW, rowHeight, 4, 4, "F");
                doc.rect(marginL, y, contentW, rowHeight - 4, "F"); // Flat top
            } else {
                doc.rect(marginL, y, contentW, rowHeight, "F");
            }
        }

        const ty = y + 9.5; // Centered baseline for row text
        let px = cols.purchaser.x;

        // 1. Trophy badge 
        if (isHighest) {
            doc.setFillColor(245, 158, 11);
            doc.setDrawColor(245, 158, 11);
            doc.setLineWidth(0.3);

            // Cup base
            doc.rect(px + 1.2, ty - 2.5, 3.6, 1, "F");
            // Cup stem
            doc.rect(px + 2.5, ty - 3.5, 1, 1, "F");
            // Cup body
            doc.triangle(px + 0.5, ty - 6.2, px + 5.5, ty - 6.2, px + 3, ty - 3.5, "F");
            // Handles
            doc.line(px + 0.5, ty - 5.8, px - 0.5, ty - 5);
            doc.line(px - 0.5, ty - 5, px + 1, ty - 4.2);
            doc.line(px + 5.5, ty - 5.8, px + 6.5, ty - 5);
            doc.line(px + 6.5, ty - 5, px + 5, ty - 4.2);
            px += 9;
        }

        // 1. Purchaser Initials
        const maxWidthPurchaser = cols.structure.x - px - 3;

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...NAVY);
        const nameStr = toInitials(offer.purchaserName);
        printTruncated(doc, nameStr, px, ty, maxWidthPurchaser);

        // 2. Structure
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY600);
        const maxWidthStructure = cols.price.x - cols.structure.x - 3;
        printTruncated(doc, toTitleCase(offer.structure), cols.structure.x, ty, maxWidthStructure);

        // 3. Offer Price
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        const tColor = isHighest ? GREEN : NAVY;
        doc.setTextColor(tColor[0], tColor[1], tColor[2]);
        const priceStr = `$${formatPrice(offer.offerPrice)}`;
        printTruncated(doc, priceStr, cols.price.x, ty, cols.deposit.x - cols.price.x - 3);

        // 4. Deposit
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY600);
        const depStr = offer.deposit > 0 ? `$${formatPrice(offer.deposit)}` : "—";
        printTruncated(doc, depStr, cols.deposit.x, ty, cols.finance.x - cols.deposit.x - 3);

        // 5. Finance
        const cx = cols.finance.x + 4;
        const dotColor = offer.financeRequired ? AMBER : GREEN;
        doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
        doc.circle(cx, ty - 1.2, 1.5, "F");

        y += rowHeight;

        // Row separator
        if (i < sortedOffers.length - 1) {
            doc.setDrawColor(229, 231, 235);
            doc.setLineWidth(0.3);
            doc.line(marginL, y, marginL + contentW, y);
        }
    }

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginL, tableStartY, contentW, y - tableStartY, 4, 4); // "S" style default draws rounded border

    // ── PAGE NUMBERS ────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY400);
        doc.text(`Page ${p} of ${totalPages}`, pageW / 2, pageH - 12, { align: "center" });
    }

    const fileName = `Vendor_Offer_Report_${data.propertyAddress.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 40)}.pdf`;
    doc.save(fileName);
}

export { formatPrice as formatReportPrice };
export type { ReportData, OfferData, AgentInfo };
