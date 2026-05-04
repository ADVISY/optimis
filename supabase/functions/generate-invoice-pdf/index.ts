// Edge Function: Génère un PDF de facture suisse premium (branding Optimis)
// avec QR-bill (Swiss QR Bill) sur une seule page A4.
// - Couleurs Optimis (vert profond #2D5A3D, accent doré #C5A059)
// - Logo PNG (fallback automatique si SVG)
// - Mise en page éditoriale, single-page A4
// - QR-bill suisse intégré en bas

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore deno
import { Buffer } from "node:buffer";
// @ts-ignore deno
import PDFDocument from "npm:pdfkit@0.15.0";
// @ts-ignore deno
import { SwissQRBill } from "npm:swissqrbill@4.2.0/pdf";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Logo PNG Optimis hébergé sur le bucket public (fallback si settings.logo_url est SVG)
const OPTIMIS_LOGO_FALLBACK =
  "https://phshmvklhwpihayanhpf.supabase.co/storage/v1/object/public/company-assets/logo/optimis-invoice-logo.png";

// Palette Optimis
const COLOR_PRIMARY = "#2D5A3D";       // vert Optimis
const COLOR_PRIMARY_DARK = "#1F3F2A";
const COLOR_ACCENT = "#C5A059";        // doré
const COLOR_BG_SOFT = "#F4F8F5";       // vert très clair
const COLOR_TEXT = "#1A1A1A";
const COLOR_MUTED = "#6B7B73";
const COLOR_BORDER = "#E2EBE5";

const DOMAIN_LABELS: Record<string, string> = {
  assurance_maladie: "Assurance maladie",
  lpp: "LPP",
  hypotheque: "Hypothèque",
  assurance_non_vie: "Assurance non-vie",
  assurance_vie: "Assurance vie",
  telecom: "Forfait télécom",
  immobilier: "Estimation immobilière",
  energie: "Énergie",
  autre: "Autre",
};

const CATEGORY_LABELS: Record<string, string> = {
  assurance_finances: "Assurance / Finances",
  telecom: "Télécom",
  immobilier: "Immobilier",
};

function buildBreadcrumb(category?: string | null, subcategory?: string | null, productName?: string | null): string {
  const parts: string[] = [];
  if (category && CATEGORY_LABELS[category]) parts.push(CATEGORY_LABELS[category]);
  if (subcategory && DOMAIN_LABELS[subcategory]) parts.push(DOMAIN_LABELS[subcategory]);
  if (productName) parts.push(productName);
  return parts.join(" › ");
}

// Format manuel : Helvetica ne contient pas l'apostrophe étroite (U+2019)
// ni l'espace insécable étroit (U+202F) que Intl utilise pour fr-CH,
// ce qui provoque l'affichage de "/" comme glyphe de remplacement.
function fmtMoney(n: number, currency: string = "CHF") {
  const fixed = (Math.round(Number(n) * 100) / 100).toFixed(2);
  const [intPart, dec] = fixed.split(".");
  const sign = intPart.startsWith("-") ? "-" : "";
  const abs = sign ? intPart.slice(1) : intPart;
  // Séparateur milliers : apostrophe ASCII (lisible Helvetica, OK pour CHF/CAD/EUR)
  const withSep = abs.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${sign}${withSep}.${dec} ${currency.toUpperCase()}`;
}
// Backwards-compat alias (utilisé pour les montants strictement CHF, ex: QR-bill)
function fmtCHF(n: number) {
  return fmtMoney(n, "CHF");
}
function fmtDate(d: string) {
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d));
}

async function streamToBuffer(stream: any): Promise<Uint8Array> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (c: any) =>
      chunks.push(c instanceof Uint8Array ? c : new Uint8Array(c))
    );
    stream.on("end", () => {
      const total = chunks.reduce((s, c) => s + c.length, 0);
      const out = new Uint8Array(total);
      let o = 0;
      for (const c of chunks) {
        out.set(c, o);
        o += c.length;
      }
      resolve(out);
    });
    stream.on("error", reject);
  });
}

// QRR check digit (Modulo 10 récursif - SIX)
function qrrCheckDigit(ref: string): string {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;
  for (const c of ref) {
    const d = parseInt(c, 10);
    if (isNaN(d)) continue;
    carry = table[(carry + d) % 10];
  }
  return String((10 - carry) % 10);
}

function buildQRR(invoiceNumber: string): string {
  const digits = invoiceNumber.replace(/\D/g, "");
  const padded = digits.padStart(26, "0").slice(-26);
  return padded + qrrCheckDigit(padded);
}

function isQRIban(iban: string): boolean {
  const clean = iban.replace(/\s/g, "");
  if (clean.length < 9) return false;
  const iid = parseInt(clean.slice(4, 9), 10);
  return iid >= 30000 && iid <= 31999;
}

async function fetchImageBuffer(url: string): Promise<{ buf: Uint8Array; isSvg: boolean } | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    const ab = await r.arrayBuffer();
    // PDFKit attend un Buffer Node, pas un Uint8Array brut (sinon il tente readFileSync).
    const buf = Buffer.from(ab);
    return { buf, isSvg: ct.includes("svg") || url.toLowerCase().endsWith(".svg") };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    // --- Auth ---
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await userClient.rpc("is_verified_admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invoice_id } = await req.json();
    if (!invoice_id || typeof invoice_id !== "string") {
      return new Response(JSON.stringify({ error: "invoice_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: invoice, error: invErr } = await admin
      .from("admin_invoices")
      .select("*, admin_clients(*), admin_invoice_lines(*)")
      .eq("id", invoice_id)
      .single();
    if (invErr || !invoice) throw new Error("invoice_not_found");

    const { data: settings } = await admin
      .from("admin_company_settings")
      .select("*")
      .limit(1)
      .single();
    if (!settings) throw new Error("settings_missing");

    // --- QR-bill data ---
    const ibanClean = settings.iban_qr.replace(/\s/g, "");
    const invoiceCurrency = (invoice.currency || "CHF").toUpperCase();
    const isQrCurrency = invoiceCurrency === "CHF" || invoiceCurrency === "EUR";
    const qrCurrency: "CHF" | "EUR" = isQrCurrency ? (invoiceCurrency as "CHF" | "EUR") : "CHF";
    const qrAmount = isQrCurrency
      ? Number(invoice.total)
      : Number((Number(invoice.total) * Number(invoice.fx_rate_to_chf || 1)).toFixed(2));

    const rawAddr = (invoice.admin_clients?.address || "").trim();
    let debtorStreet = rawAddr || "Adresse non renseignée";
    let debtorZip = "1000";
    let debtorCity = "Suisse";
    const m = rawAddr.match(/^(.*?)[,\n\s]+(\d{4,5})\s+(.+)$/);
    if (m) {
      debtorStreet = m[1].trim();
      debtorZip = m[2].trim();
      debtorCity = m[3].trim();
    }

    const qrData: any = {
      currency: qrCurrency,
      amount: qrAmount,
      additionalInformation: invoice.invoice_number,
      creditor: {
        name: settings.company_name,
        address: settings.address_line1,
        zip: settings.postal_code,
        city: settings.city,
        country: settings.country || "CH",
        account: ibanClean,
      },
      debtor: {
        name: invoice.admin_clients?.company_name || "Client",
        address: debtorStreet,
        zip: debtorZip,
        city: debtorCity,
        country: "CH",
      },
    };

    if (isQRIban(ibanClean)) {
      qrData.reference = buildQRR(invoice.invoice_number);
    }

    // --- PDF (A4 single page) ---
    // A4: 595 x 842 pt. QR-bill occupe ~298pt en bas. On garde la facture dans 0-544pt.
    const PAGE_W = 595;
    const PAGE_H = 842;
    const MARGIN_X = 45;
    const CONTENT_W = PAGE_W - MARGIN_X * 2; // 505
    const QR_BILL_HEIGHT = 298; // hauteur réservée au QR
    const FACTURE_BOTTOM = PAGE_H - QR_BILL_HEIGHT - 10; // ~534

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      info: {
        Title: `Facture ${invoice.invoice_number}`,
        Author: settings.company_name,
        Subject: `Facture ${invoice.invoice_number}`,
      },
    });
    const bufferPromise = streamToBuffer(doc);

    // ====== HEADER (bandeau blanc avec accent doré + logo) ======
    // Liseré doré en haut
    doc.rect(0, 0, PAGE_W, 4).fill(COLOR_ACCENT);

    // Logo (PNG forcé : si settings.logo_url est SVG, on bascule sur fallback PNG Optimis)
    let logoLoaded = false;
    let logoUrl = settings.logo_url || OPTIMIS_LOGO_FALLBACK;
    let img = await fetchImageBuffer(logoUrl);
    if (!img || img.isSvg) {
      // SVG non supporté → fallback PNG Optimis
      img = await fetchImageBuffer(OPTIMIS_LOGO_FALLBACK);
    }
    if (img && !img.isSvg) {
      try {
        doc.image(img.buf, MARGIN_X, 24, { fit: [170, 60] });
        logoLoaded = true;
      } catch (e) {
        console.warn("[pdf] logo image error", e);
      }
    }

    // Bloc entreprise (sous le logo, petit & discret)
    const entY = 92;
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(COLOR_PRIMARY)
      .text(settings.company_name, MARGIN_X, entY, { width: 260 });
    doc.font("Helvetica").fontSize(8.5).fillColor(COLOR_MUTED);
    let yEnt = entY + 13;
    doc.text(settings.address_line1, MARGIN_X, yEnt, { width: 260 });
    yEnt += 11;
    doc.text(`${settings.postal_code} ${settings.city}`, MARGIN_X, yEnt, { width: 260 });
    yEnt += 11;
    if (settings.contact_email) {
      doc.text(settings.contact_email, MARGIN_X, yEnt, { width: 260 });
      yEnt += 11;
    }
    if (settings.vat_number) {
      doc.text(`N° TVA : ${settings.vat_number}`, MARGIN_X, yEnt, { width: 260 });
    }

    // Bloc FACTURE (droite, encadré vert)
    const boxW = 200;
    const boxX = PAGE_W - MARGIN_X - boxW;
    const boxY = 24;
    const boxH = 88;
    doc.roundedRect(boxX, boxY, boxW, boxH, 6).fill(COLOR_PRIMARY);
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#fff")
      .text("FACTURE", boxX + 14, boxY + 12, { width: boxW - 28 });
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#D9E5DD")
      .text("N° de facture", boxX + 14, boxY + 40);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#fff")
      .text(invoice.invoice_number, boxX + 14, boxY + 52);

    // Dates sous le bloc
    const dY = boxY + boxH + 8;
    doc.font("Helvetica").fontSize(8.5).fillColor(COLOR_MUTED);
    doc.text("Date :", boxX + 14, dY);
    doc.font("Helvetica-Bold").fillColor(COLOR_TEXT).text(fmtDate(invoice.invoice_date), boxX + 50, dY);
    doc.font("Helvetica").fillColor(COLOR_MUTED).text("Échéance :", boxX + 14, dY + 13);
    doc.font("Helvetica-Bold").fillColor(COLOR_TEXT).text(fmtDate(invoice.due_date), boxX + 70, dY + 13);

    // ====== BLOC CLIENT ======
    const clientY = 175;
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(COLOR_ACCENT)
      .text("FACTURÉ À", MARGIN_X, clientY, { characterSpacing: 1.2 });

    // Bande verticale dorée
    doc.rect(MARGIN_X, clientY + 14, 3, 60).fill(COLOR_ACCENT);

    const cX = MARGIN_X + 14;
    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor(COLOR_PRIMARY_DARK)
      .text(invoice.admin_clients?.company_name || "—", cX, clientY + 14, { width: 350 });
    let yC = clientY + 32;
    doc.font("Helvetica").fontSize(9.5).fillColor(COLOR_TEXT);
    if (invoice.admin_clients?.contact_name) {
      doc.text(invoice.admin_clients.contact_name, cX, yC, { width: 350 });
      yC += 12;
    }
    if (invoice.admin_clients?.address) {
      doc.fillColor(COLOR_MUTED).text(invoice.admin_clients.address, cX, yC, { width: 350 });
      yC += 12;
    }
    if (invoice.admin_clients?.email) {
      doc.fillColor(COLOR_MUTED).text(invoice.admin_clients.email, cX, yC, { width: 350 });
    }

    // ====== TABLEAU LIGNES ======
    let y = 270;

    // En-tête
    doc.rect(MARGIN_X, y, CONTENT_W, 26).fill(COLOR_PRIMARY);
    const colDescX = MARGIN_X + 12;
    const colQtyX = MARGIN_X + 320;
    const colPriceX = MARGIN_X + 365;
    const colTotalX = MARGIN_X + 430;

    doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff");
    doc.text("DESCRIPTION", colDescX, y + 9, { characterSpacing: 0.8 });
    doc.text("QTÉ", colQtyX, y + 9, { width: 35, align: "right" });
    doc.text("PRIX UNIT.", colPriceX, y + 9, { width: 60, align: "right" });
    doc.text("TOTAL", colTotalX, y + 9, { width: 60, align: "right" });

    y += 26;

    const lines = (invoice.admin_invoice_lines ?? []).sort(
      (a: any, b: any) => a.position - b.position
    );

    let zebra = false;
    const maxY = FACTURE_BOTTOM - 110; // garde de la place pour les totaux

    for (const ln of lines) {
      const breadcrumb = buildBreadcrumb(ln.category, ln.subcategory, ln.product_name);

      // Hauteurs réelles de chaque bloc (le breadcrumb peut wrap sur 2 lignes)
      const breadcrumbH = breadcrumb
        ? doc.font("Helvetica-Bold").fontSize(7.5)
            .heightOfString(breadcrumb.toUpperCase(), { width: 290, characterSpacing: 0.8 })
        : 0;
      const descH = doc.font("Helvetica").fontSize(9.5)
        .heightOfString(ln.description, { width: 290 });

      const PAD_TOP = 8;
      const PAD_BOT = 8;
      const GAP = breadcrumb ? 4 : 0;
      const rowH = Math.max(28, PAD_TOP + breadcrumbH + GAP + descH + PAD_BOT);

      // Stop si ça déborde (sécurité single-page)
      if (y + rowH > maxY) {
        doc.font("Helvetica-Oblique").fontSize(8).fillColor(COLOR_MUTED)
          .text(`+ ${lines.length - lines.indexOf(ln)} ligne(s) supplémentaire(s)…`, MARGIN_X, y + 4);
        y += 14;
        break;
      }

      // Fond zébré
      if (zebra) {
        doc.rect(MARGIN_X, y, CONTENT_W, rowH).fill(COLOR_BG_SOFT);
      }
      zebra = !zebra;

      let textY = y + PAD_TOP;
      if (breadcrumb) {
        doc
          .font("Helvetica-Bold")
          .fontSize(7.5)
          .fillColor(COLOR_ACCENT)
          .text(breadcrumb.toUpperCase(), colDescX, textY, { width: 290, characterSpacing: 0.8 });
        textY += breadcrumbH + GAP;
      }

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLOR_TEXT)
        .text(ln.description, colDescX, textY, { width: 290 });

      // Valeurs alignées verticalement au centre de la ligne
      const valY = y + (rowH - 11) / 2;
      doc.font("Helvetica").fontSize(9.5).fillColor(COLOR_TEXT);
      doc.text(String(ln.quantity), colQtyX, valY, { width: 35, align: "right" });
      doc.text(fmtCHF(Number(ln.unit_price)), colPriceX, valY, { width: 60, align: "right" });
      doc.font("Helvetica-Bold").text(fmtCHF(Number(ln.line_total)), colTotalX, valY, { width: 60, align: "right" });

      // Séparateur fin
      doc
        .strokeColor(COLOR_BORDER)
        .lineWidth(0.5)
        .moveTo(MARGIN_X, y + rowH)
        .lineTo(MARGIN_X + CONTENT_W, y + rowH)
        .stroke();

      y += rowH;
    }

    // ====== TOTAUX ======
    y += 14;
    const totalsX = MARGIN_X + 280;
    const totalsW = CONTENT_W - 280;
    const labelX = totalsX;
    const valX = totalsX + totalsW - 100;

    doc.font("Helvetica").fontSize(9.5).fillColor(COLOR_MUTED)
      .text("Sous-total", labelX, y, { width: 120 });
    doc.fillColor(COLOR_TEXT)
      .text(fmtCHF(Number(invoice.subtotal)), valX, y, { width: 100, align: "right" });

    y += 16;
    doc.fillColor(COLOR_MUTED)
      .text(`TVA (${Number(invoice.vat_rate)}%)`, labelX, y, { width: 120 });
    doc.fillColor(COLOR_TEXT)
      .text(fmtCHF(Number(invoice.vat_amount)), valX, y, { width: 100, align: "right" });

    y += 22;
    // Bloc Total premium
    doc.roundedRect(totalsX - 6, y - 6, totalsW + 6, 34, 4).fill(COLOR_PRIMARY);
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#fff")
      .text(`TOTAL ${invoiceCurrency}`, labelX, y + 4, { width: 120 });
    doc.fontSize(14)
      .text(fmtCHF(Number(invoice.total)), valX - 10, y + 2, { width: 110, align: "right" });

    // Notes (si place)
    if (invoice.notes && y + 60 < FACTURE_BOTTOM - 30) {
      y += 50;
      doc.font("Helvetica-Bold").fontSize(8).fillColor(COLOR_ACCENT)
        .text("NOTES", MARGIN_X, y, { characterSpacing: 1.2 });
      doc.font("Helvetica").fontSize(8.5).fillColor(COLOR_MUTED)
        .text(invoice.notes, MARGIN_X, y + 12, { width: CONTENT_W });
    }

    // Footer (juste au-dessus du QR)
    if (settings.invoice_footer) {
      doc.font("Helvetica-Oblique").fontSize(7.5).fillColor(COLOR_MUTED)
        .text(settings.invoice_footer, MARGIN_X, FACTURE_BOTTOM - 16, {
          width: CONTENT_W,
          align: "center",
        });
    }

    // Trait séparateur avant QR
    doc.strokeColor(COLOR_BORDER).lineWidth(0.5)
      .moveTo(0, FACTURE_BOTTOM)
      .lineTo(PAGE_W, FACTURE_BOTTOM)
      .stroke();

    // ====== QR-BILL SUISSE ======
    const qrBill = new SwissQRBill(qrData);
    qrBill.attachTo(doc);

    doc.end();
    const pdfBuffer = await bufferPromise;

    // --- Upload ---
    const path = `${invoice.invoice_number}.pdf`;
    const { error: upErr } = await admin.storage
      .from("invoices")
      .upload(path, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) throw upErr;

    const { data: signed } = await admin.storage
      .from("invoices")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    return new Response(
      JSON.stringify({ success: true, url: signed?.signedUrl, path }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("[generate-invoice-pdf] error", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message ?? String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
