/**
 * Normalizes the simple quote JSON payload (language-neutral keys).
 */

const ASSET_ALIASES = {
  product_placeholder: "productPlaceholder",
  productPlaceholder: "productPlaceholder",
  qr_placeholder: "qrPlaceholder",
  qrPlaceholder: "qrPlaceholder",
  not_approved_stamp: "notApprovedStamp",
  notApprovedStamp: "notApprovedStamp",
  not_approved: "notApprovedBadge",
  notApprovedBadge: "notApprovedBadge"
};

function resolveAssetKey(key) {
  if (key == null || key === "") return "";
  const s = String(key);
  return ASSET_ALIASES[s] || s;
}

function normalizeQuotePayload(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  if (raw.docDefinition) {
    return null;
  }

  const d = { ...raw };

  d.customer_name = d.customer_name != null ? String(d.customer_name) : "";
  d.customer_address = d.customer_address != null ? String(d.customer_address) : "";
  d.customer_phone = d.customer_phone != null ? String(d.customer_phone) : "";
  d.customer_email = d.customer_email != null ? String(d.customer_email) : "";

  d.quote_title = d.quote_title != null ? String(d.quote_title) : "Quote";
  d.quote_reference = d.quote_reference != null ? String(d.quote_reference) : "";
  d.quote_date = d.quote_date != null ? String(d.quote_date) : "";
  d.prepared_by = d.prepared_by != null ? String(d.prepared_by) : "";
  d.contact = d.contact != null ? String(d.contact) : "";

  d.not_approved = Boolean(d.not_approved);
  d.letter = d.letter != null ? String(d.letter) : "";

  d.line_items = Array.isArray(d.line_items) ? d.line_items : [];
  d.totals = Array.isArray(d.totals) ? d.totals : [];

  d.terms_sections = Array.isArray(d.terms_sections) ? d.terms_sections : [];

  d.payment_details = d.payment_details && typeof d.payment_details === "object" ? d.payment_details : null;

  d.stamp = {
    show: false,
    image: "notApprovedStamp",
    width: 100,
    height: 100,
    ...(typeof d.stamp === "object" && d.stamp ? d.stamp : {})
  };

  d.original_filename =
    d.original_filename != null ? String(d.original_filename) : "quote.pdf";

  return d;
}

module.exports = {
  normalizeQuotePayload,
  resolveAssetKey
};
