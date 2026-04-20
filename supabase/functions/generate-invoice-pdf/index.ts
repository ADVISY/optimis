// Edge Function: Génère un PDF de facture suisse avec QR-bill (Swiss QR Bill)
// Appelée depuis l'admin avec un invoice_id. Vérifie que l'utilisateur est admin,
// charge la facture + les lignes + client + paramètres entreprise, génère le PDF
// avec PDFKit + Swiss QR Bill, l'upload dans le bucket "invoices" et retourne
// une URL signée.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
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

function fmtCHF(n: number) {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(n);
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

    // --- Service role pour fetch+upload ---
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

    // --- Préparation Swiss QR Bill ---
    const qrData = {
      currency: "CHF" as const,
      amount: Number(invoice.total),
      additionalInformation: invoice.invoice_number,
      creditor: {
        name: settings.company_name,
        address: settings.address_line1,
        zip: settings.postal_code,
        city: settings.city,
        country: settings.country || "CH",
        account: settings.iban_qr.replace(/\s/g, ""),
      },
      debtor: {
        name: invoice.admin_clients?.company_name || "Client",
        address: invoice.admin_clients?.address || "—",
        zip: "0000",
        city: "—",
        country: "CH",
      },
    };

    // --- PDF ---
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const bufferPromise = streamToBuffer(doc);

    const GREEN = "#2D5A3D";
    const GREY = "#666666";

    // En-tête entreprise
    doc.fontSize(20).fillColor(GREEN).text(settings.company_name, 50, 50);
    doc
      .fontSize(9)
      .fillColor(GREY)
      .text(settings.address_line1, 50, 78)
      .text(`${settings.postal_code} ${settings.city}`, 50, 92);
    if (settings.contact_email)
      doc.text(settings.contact_email, 50, 106);
    if (settings.vat_number) doc.text(`TVA : ${settings.vat_number}`, 50, 120);

    // Bloc facture (droite)
    doc
      .fontSize(22)
      .fillColor(GREEN)
      .text("FACTURE", 350, 50, { align: "right", width: 200 });
    doc
      .fontSize(10)
      .fillColor("#000")
      .text(invoice.invoice_number, 350, 80, { align: "right", width: 200 });
    doc
      .fontSize(9)
      .fillColor(GREY)
      .text(`Date : ${fmtDate(invoice.invoice_date)}`, 350, 96, {
        align: "right",
        width: 200,
      })
      .text(`Échéance : ${fmtDate(invoice.due_date)}`, 350, 110, {
        align: "right",
        width: 200,
      });

    // Bloc client
    doc
      .fontSize(9)
      .fillColor(GREY)
      .text("FACTURÉ À", 50, 170);
    doc
      .fontSize(11)
      .fillColor("#000")
      .text(invoice.admin_clients?.company_name || "—", 50, 184);
    if (invoice.admin_clients?.contact_name)
      doc
        .fontSize(9)
        .fillColor(GREY)
        .text(invoice.admin_clients.contact_name, 50, 200);
    if (invoice.admin_clients?.address)
      doc.text(invoice.admin_clients.address, 50, 214);
    if (invoice.admin_clients?.email)
      doc.text(invoice.admin_clients.email, 50, 228);

    // Tableau lignes
    let y = 280;
    doc.rect(50, y, 495, 24).fill(GREEN);
    doc
      .fillColor("#fff")
      .fontSize(9)
      .text("Description", 60, y + 8)
      .text("Qté", 340, y + 8, { width: 40, align: "right" })
      .text("Prix unit.", 385, y + 8, { width: 70, align: "right" })
      .text("Total", 460, y + 8, { width: 80, align: "right" });

    y += 30;
    const lines = (invoice.admin_invoice_lines ?? []).sort(
      (a: any, b: any) => a.position - b.position
    );

    for (const ln of lines) {
      doc.fillColor("#000").fontSize(9.5);
      doc.text(ln.description, 60, y, { width: 270 });
      doc.text(String(ln.quantity), 340, y, { width: 40, align: "right" });
      doc.text(fmtCHF(Number(ln.unit_price)), 385, y, {
        width: 70,
        align: "right",
      });
      doc.text(fmtCHF(Number(ln.line_total)), 460, y, {
        width: 80,
        align: "right",
      });
      y += 22;
      doc
        .strokeColor("#eaeaea")
        .lineWidth(0.5)
        .moveTo(50, y - 4)
        .lineTo(545, y - 4)
        .stroke();
    }

    // Totaux
    y += 10;
    const labelX = 360;
    const valX = 460;

    doc
      .fontSize(10)
      .fillColor(GREY)
      .text("Sous-total", labelX, y, { width: 90, align: "right" });
    doc
      .fillColor("#000")
      .text(fmtCHF(Number(invoice.subtotal)), valX, y, {
        width: 80,
        align: "right",
      });

    y += 18;
    doc
      .fillColor(GREY)
      .text(`TVA (${Number(invoice.vat_rate)}%)`, labelX, y, {
        width: 90,
        align: "right",
      });
    doc
      .fillColor("#000")
      .text(fmtCHF(Number(invoice.vat_amount)), valX, y, {
        width: 80,
        align: "right",
      });

    y += 22;
    doc
      .rect(labelX - 10, y - 4, 200, 28)
      .fillColor(GREEN)
      .fill();
    doc
      .fillColor("#fff")
      .fontSize(12)
      .text("Total CHF", labelX, y + 4, { width: 90, align: "right" });
    doc.text(fmtCHF(Number(invoice.total)), valX, y + 4, {
      width: 80,
      align: "right",
    });

    // Notes
    if (invoice.notes) {
      y += 50;
      doc
        .fontSize(9)
        .fillColor(GREY)
        .text("Notes :", 50, y);
      doc.fillColor("#000").text(invoice.notes, 50, y + 12, { width: 495 });
    }

    // Footer
    if (settings.invoice_footer) {
      doc
        .fontSize(8)
        .fillColor(GREY)
        .text(settings.invoice_footer, 50, 720, { width: 495, align: "center" });
    }

    // --- QR-bill suisse en bas de page ---
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
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 jours

    return new Response(
      JSON.stringify({
        success: true,
        url: signed?.signedUrl,
        path,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    console.error("[generate-invoice-pdf] error", e);
    return new Response(
      JSON.stringify({ success: false, error: e.message ?? String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
