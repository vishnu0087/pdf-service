const React = require("react");

function formatCurrency(value = 0, currency = "INR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function normalizePayload(data) {
  const payload = data || {};
  return {
    documentTitle: payload.documentTitle || "Sales Report",
    companyName: payload.companyName || "Your Company Name",
    reference: payload.reference || "REF-001",
    generatedAt: payload.generatedAt || new Date().toISOString(),
    clientName: payload.clientName || "",
    clientEmail: payload.clientEmail || "",
    clientPhone: payload.clientPhone || "",
    clientAddress: payload.clientAddress || "",
    currency: payload.currency || "INR",
    items: Array.isArray(payload.items) ? payload.items : [],
    notes: payload.notes || "",
    footerLeft: payload.footerLeft || "Auto generated report",
    footerRight: payload.footerRight || "Powered by PDF Service"
  };
}

function Header({ data }) {
  return React.createElement(
    "header",
    { className: "pdf-keep-together flex items-start justify-between border-b border-slate-200 pb-4" },
    React.createElement(
      "h1",
      { className: "text-xl font-bold text-slate-900" },
      data.companyName
    ),
    React.createElement(
      "div",
      { className: "text-right" },
      React.createElement("h2", { className: "text-lg font-semibold text-slate-900" }, data.documentTitle),
      React.createElement("p", { className: "text-xs text-slate-600" }, "Reference: ", data.reference),
      React.createElement("p", { className: "text-xs text-slate-600" }, "Date: ", formatDate(data.generatedAt))
    )
  );
}

function MetaGrid({ data }) {
  return React.createElement(
    "section",
    { className: "pdf-keep-together mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4" },
    React.createElement(
      "div",
      { className: "grid grid-cols-2 gap-3 text-sm" },
      React.createElement(
        "div",
        { className: "rounded bg-white p-3 ring-1 ring-slate-200" },
        React.createElement("p", { className: "text-xs uppercase text-slate-500" }, "Client"),
        React.createElement("p", { className: "mt-1 font-semibold text-slate-900" }, data.clientName || "-")
      ),
      React.createElement(
        "div",
        { className: "rounded bg-white p-3 ring-1 ring-slate-200" },
        React.createElement("p", { className: "text-xs uppercase text-slate-500" }, "Email"),
        React.createElement("p", { className: "mt-1 font-semibold text-slate-900" }, data.clientEmail || "-")
      ),
      React.createElement(
        "div",
        { className: "rounded bg-white p-3 ring-1 ring-slate-200" },
        React.createElement("p", { className: "text-xs uppercase text-slate-500" }, "Phone"),
        React.createElement("p", { className: "mt-1 font-semibold text-slate-900" }, data.clientPhone || "-")
      ),
      React.createElement(
        "div",
        { className: "rounded bg-white p-3 ring-1 ring-slate-200" },
        React.createElement("p", { className: "text-xs uppercase text-slate-500" }, "Address"),
        React.createElement("p", { className: "mt-1 font-semibold text-slate-900" }, data.clientAddress || "-")
      )
    )
  );
}

function DataTable({ data }) {
  const rows = data.items;
  const total = rows.reduce(
    (sum, row) => sum + Number(row.quantity || 0) * Number(row.unitPrice || 0),
    0
  );

  return React.createElement(
    "section",
    { className: "pdf-keep-together mt-6" },
    React.createElement("h3", { className: "mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700" }, "Items"),
    React.createElement(
      "div",
      { className: "overflow-hidden rounded-lg border border-slate-200" },
      React.createElement(
        "table",
        { className: "min-w-full border-collapse text-sm" },
        React.createElement(
          "thead",
          { className: "bg-slate-100 text-left text-slate-700" },
          React.createElement(
            "tr",
            null,
            React.createElement("th", { className: "px-3 py-2 font-semibold" }, "Description"),
            React.createElement("th", { className: "px-3 py-2 font-semibold" }, "Qty"),
            React.createElement("th", { className: "px-3 py-2 font-semibold" }, "Unit Price"),
            React.createElement("th", { className: "px-3 py-2 font-semibold" }, "Amount")
          )
        ),
        React.createElement(
          "tbody",
          null,
          rows.map((row, index) =>
            React.createElement(
              "tr",
              { key: `row-${index}`, className: index % 2 === 0 ? "bg-white" : "bg-slate-50" },
              React.createElement("td", { className: "px-3 py-2 text-slate-700" }, String(row.description || "-")),
              React.createElement("td", { className: "px-3 py-2 text-slate-700" }, String(row.quantity ?? "-")),
              React.createElement("td", { className: "px-3 py-2 text-slate-700" }, formatCurrency(row.unitPrice || 0, data.currency)),
              React.createElement(
                "td",
                { className: "px-3 py-2 text-slate-700" },
                formatCurrency(Number(row.quantity || 0) * Number(row.unitPrice || 0), data.currency)
              )
            )
          ),
          React.createElement(
            "tr",
            { className: "bg-slate-100" },
            React.createElement("td", { className: "px-3 py-2 font-semibold text-slate-900", colSpan: 3 }, "Total"),
            React.createElement("td", { className: "px-3 py-2 font-semibold text-slate-900" }, formatCurrency(total, data.currency))
          )
        )
      )
    )
  );
}

function Footer({ data }) {
  return React.createElement(
    "footer",
    { className: "pdf-keep-together mt-8 border-t border-slate-200 pt-3 text-xs text-slate-500" },
    React.createElement(
      "div",
      { className: "flex items-center justify-between" },
      React.createElement("p", null, data.footerLeft),
      React.createElement("p", null, data.footerRight)
    ),
    data.notes
      ? React.createElement("p", { className: "mt-2 text-xs text-slate-600" }, "Notes: ", data.notes)
      : null
  );
}

function PdfTemplate({ data }) {
  const payload = normalizePayload(data);

  return React.createElement(
    "main",
    { className: "mx-auto max-w-4xl bg-white p-8 text-slate-800" },
    React.createElement(Header, { data: payload }),
    React.createElement(MetaGrid, { data: payload }),
    React.createElement(DataTable, { data: payload }),
    React.createElement(Footer, { data: payload })
  );
}

module.exports = { PdfTemplate };
