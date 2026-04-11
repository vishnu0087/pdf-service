const React = require("react");
const { getAssetDataUrl } = require("./assetUrls");
const { resolveAssetKey } = require("./quoteNormalize");

const FONT = '"Montserrat", ui-sans-serif, sans-serif';
const C = {
  text: "#333",
  muted: "#444",
  border: "#ddd",
  headerBg: "#ffb74d",
  labelBg: "#eeeeee",
  totalHi: "#ffb74d",
  totalMuted: "#dddddd",
  notApprovedBg: "#c62828",
  notApprovedFg: "#ffffff"
};

function cellStyle(extra) {
  return {
    fontFamily: FONT,
    fontSize: "10pt",
    lineHeight: 1.35,
    color: C.text,
    ...extra
  };
}

function renderProductLines(lines) {
  if (lines == null) return null;
  const arr = Array.isArray(lines) ? lines : [lines];
  return arr.filter(Boolean).join("\n");
}

function ProductCell({ lines }) {
  const text = renderProductLines(lines);
  return React.createElement(
    "div",
    {
      style: {
        ...cellStyle(),
        whiteSpace: "pre-wrap",
        textAlign: "left"
      }
    },
    text
  );
}

function ImgCell({ assetKey, widthPt, heightPt }) {
  const key = resolveAssetKey(assetKey);
  const src = getAssetDataUrl(key);
  if (!src) {
    return React.createElement("div", { style: { minHeight: "40pt" } }, "\u00a0");
  }
  const st = {
    display: "block",
    margin: "0 auto",
    width: widthPt ? `${widthPt}pt` : "40pt",
    height: heightPt ? `${heightPt}pt` : "40pt",
    objectFit: "contain"
  };
  return React.createElement("img", { src, alt: "", style: st });
}

function TableHeaderRow() {
  const headers = [
    "Sr. No",
    "Image",
    "Product Name",
    "HSN\nGST %",
    "Price",
    "Qty.",
    "Disc.",
    "Total"
  ];
  return React.createElement(
    "tr",
    null,
    headers.map((h, i) =>
      React.createElement(
        "th",
        {
          key: i,
          style: {
            ...cellStyle({ fontWeight: 700, textAlign: "center", backgroundColor: C.headerBg }),
            border: `1px solid ${C.border}`,
            padding: "4pt",
            verticalAlign: "middle",
            whiteSpace: "pre-wrap"
          }
        },
        h
      )
    )
  );
}

function SpacerRow() {
  return React.createElement(
    "tr",
    null,
    React.createElement("td", { colSpan: 8, style: { border: `1px solid ${C.border}`, padding: "2pt", height: "8pt" } }, "\u00a0")
  );
}

function LabelRow({ text }) {
  return React.createElement(
    "tr",
    null,
    React.createElement(
      "td",
      {
        colSpan: 8,
        style: {
          ...cellStyle({ fontWeight: 700, textAlign: "center", backgroundColor: C.labelBg }),
          border: `1px solid ${C.border}`,
          padding: "6pt"
        }
      },
      text
    )
  );
}

function ProductRow({ item }) {
  const totalBg =
    item.total_cell === "muted" ? C.totalMuted : item.total_cell === "highlight" ? C.totalHi : "transparent";
  const totalBold = item.total_cell === "highlight" || item.total_cell === "muted";

  return React.createElement(
    "tr",
    null,
    React.createElement(
      "td",
      {
        style: {
          ...cellStyle({ fontWeight: 700 }),
          border: `1px solid ${C.border}`,
          padding: "4pt",
          verticalAlign: "top"
        }
      },
      item.serial || ""
    ),
    React.createElement(
      "td",
      {
        style: {
          border: `1px solid ${C.border}`,
          padding: "4pt",
          verticalAlign: "middle",
          textAlign: "center"
        }
      },
      React.createElement(ImgCell, {
        assetKey: item.image || "productPlaceholder",
        widthPt: item.image_width || 40,
        heightPt: item.image_height || 40
      })
    ),
    React.createElement(
      "td",
      {
        style: {
          border: `1px solid ${C.border}`,
          padding: "4pt",
          verticalAlign: "top"
        }
      },
      React.createElement(ProductCell, { lines: item.product_lines })
    ),
    React.createElement(
      "td",
      {
        style: {
          ...cellStyle(),
          border: `1px solid ${C.border}`,
          padding: "4pt",
          verticalAlign: "top",
          textAlign: "center",
          whiteSpace: "pre-wrap"
        }
      },
      item.hsn_gst || ""
    ),
    React.createElement(
      "td",
      {
        style: {
          ...cellStyle(),
          border: `1px solid ${C.border}`,
          padding: "4pt",
          verticalAlign: "top",
          textAlign: "center"
        }
      },
      item.price || ""
    ),
    React.createElement(
      "td",
      {
        style: {
          ...cellStyle(),
          border: `1px solid ${C.border}`,
          padding: "4pt",
          verticalAlign: "top",
          textAlign: "center",
          whiteSpace: "pre-wrap"
        }
      },
      item.qty || ""
    ),
    React.createElement(
      "td",
      {
        style: {
          ...cellStyle(),
          border: `1px solid ${C.border}`,
          padding: "4pt",
          verticalAlign: "top",
          textAlign: "center"
        }
      },
      item.discount != null ? String(item.discount) : ""
    ),
    React.createElement(
      "td",
      {
        style: {
          ...cellStyle({
            fontWeight: totalBold ? 700 : 400,
            textAlign: "center",
            backgroundColor: totalBg === "transparent" ? undefined : totalBg
          }),
          border: `1px solid ${C.border}`,
          padding: "4pt",
          verticalAlign: "top"
        }
      },
      item.total || ""
    )
  );
}

function MainLineItems({ items }) {
  const rows = [React.createElement(SpacerRow, { key: "spacer-after-header" })];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it || typeof it !== "object") continue;
    const t = it.type;
    if (t === "spacer") {
      rows.push(React.createElement(SpacerRow, { key: `sp-${i}` }));
    } else if (t === "label") {
      rows.push(React.createElement(LabelRow, { key: `lb-${i}`, text: it.text || "" }));
    } else if (t === "product") {
      rows.push(React.createElement(ProductRow, { key: `pr-${i}`, item: it }));
    }
  }

  return React.createElement(
    "table",
    {
      className: "quote-table-main",
      style: {
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
        fontFamily: FONT,
        fontSize: "10pt"
      }
    },
    React.createElement(
      "colgroup",
      null,
      ["5%", "9%", "36%", "10%", "11%", "10%", "7%", "12%"].map((w, idx) =>
        React.createElement("col", { key: idx, style: { width: w } })
      )
    ),
    React.createElement("tbody", null, React.createElement(TableHeaderRow, null), ...rows)
  );
}

function TotalsBlock({ totals }) {
  if (!totals.length) return null;
  return React.createElement(
    "div",
    { style: { marginTop: "12pt", display: "flex", justifyContent: "flex-end" } },
    React.createElement(
      "table",
      {
        style: {
          borderCollapse: "collapse",
          minWidth: "220pt",
          fontFamily: FONT,
          fontSize: "10pt"
        }
      },
      React.createElement(
        "tbody",
        null,
        totals.map((row, i) =>
          React.createElement(
            "tr",
            { key: i },
            React.createElement(
              "td",
              {
                style: {
                  ...cellStyle({
                    fontWeight: row.bold ? 700 : 400,
                    textAlign: "left",
                    padding: "4pt 12pt 4pt 4pt",
                    borderBottom: `1px solid ${C.border}`
                  })
                }
              },
              row.label || ""
            ),
            React.createElement(
              "td",
              {
                style: {
                  ...cellStyle({
                    fontWeight: row.bold ? 700 : 400,
                    textAlign: "center",
                    padding: "4pt",
                    borderBottom: `1px solid ${C.border}`
                  })
                }
              },
              row.value || ""
            )
          )
        )
      )
    )
  );
}

function TermsBlock({ sections }) {
  if (!sections.length) return null;
  return React.createElement(
    "div",
    { style: { marginTop: "14pt" } },
    sections.map((sec, si) =>
      React.createElement(
        "div",
        { key: si, style: { marginBottom: "12pt" } },
        React.createElement(
          "div",
          {
            style: {
              ...cellStyle({
                fontWeight: 700,
                textDecoration: "underline",
                marginBottom: "4pt"
              })
            }
          },
          sec.title || ""
        ),
        React.createElement(
          "ul",
          {
            style: {
              margin: 0,
              paddingLeft: "18pt",
              listStyleType: "disc",
              ...cellStyle()
            }
          },
          (sec.items || []).map((line, li) =>
            React.createElement("li", { key: li, style: { marginBottom: "3pt" } }, line)
          )
        )
      )
    )
  );
}

function PaymentCell({ cell }) {
  if (!cell) return React.createElement("td", { style: { padding: "4pt", border: `1px solid ${C.border}` } }, "");
  if (cell.image) {
    const key = resolveAssetKey(cell.image);
    const src = getAssetDataUrl(key);
    const w = cell.width != null ? cell.width : 150;
    return React.createElement(
      "td",
      {
        colSpan: cell.colspan || 1,
        rowSpan: cell.rowspan || 1,
        style: {
          padding: "4pt",
          border: `1px solid ${C.border}`,
          verticalAlign: "top",
          textAlign: "center"
        }
      },
      src
        ? React.createElement("img", {
            src,
            alt: "",
            style: { width: `${w}pt`, height: "auto", display: "inline-block" }
          })
        : null
    );
  }
  return React.createElement(
    "td",
    {
      colSpan: cell.colspan || 1,
      rowSpan: cell.rowspan || 1,
      style: {
        ...cellStyle({
          color: C.muted,
          fontWeight: cell.bold ? 700 : 400
        }),
        padding: "4pt",
        border: `1px solid ${C.border}`,
        verticalAlign: "top"
      }
    },
        cell.text != null ? String(cell.text) : ""
  );
}


function PaymentDetailsTable({ payment }) {
  if (!payment || !Array.isArray(payment.rows)) return null;
  return React.createElement(
    "div",
    null,
    payment.title
      ? React.createElement(
          "div",
          {
            style: {
              ...cellStyle({
                fontWeight: 700,
                color: C.muted,
                textDecoration: "underline",
                margin: "16pt 0 8pt 0"
              })
            }
          },
          payment.title
        )
      : null,
    React.createElement(
      "table",
      {
        style: {
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: FONT,
          fontSize: "10pt"
        }
      },
      React.createElement(
        "tbody",
        null,
        payment.rows.map((pair, ri) =>
          React.createElement(
            "tr",
            { key: ri },
            pair.map((c, ci) => React.createElement(PaymentCell, { key: ci, cell: c }))
          )
        )
      )
    )
  );
}

function StampBlock({ stamp }) {
  if (!stamp || !stamp.show) return null;
  const key = resolveAssetKey(stamp.image || "notApprovedStamp");
  const src = getAssetDataUrl(key);
  if (!src) return null;
  const w = stamp.width != null ? stamp.width : 100;
  const h = stamp.height != null ? stamp.height : 100;
  return React.createElement(
    "div",
    { style: { textAlign: "center", marginTop: "15pt" } },
    React.createElement("img", {
      src,
      alt: "",
      style: { width: `${w}pt`, height: `${h}pt`, objectFit: "contain" }
    })
  );
}

function QuoteTemplate({ data }) {
  const addr = data.customer_address
    ? `Address: ${data.customer_address}`
    : "";
  const leftBlock = [data.customer_name, addr, `Phone: ${data.customer_phone}`, `Email: ${data.customer_email}`]
    .filter(Boolean)
    .join("\n");

  const badgeSrc = data.not_approved ? getAssetDataUrl("notApprovedBadge") : "";

  return React.createElement(
    "div",
    {
      className: "quote-doc",
      style: {
        fontFamily: FONT,
        fontSize: "10pt",
        lineHeight: 1.35,
        color: C.text,
        boxSizing: "border-box"
      }
    },
    React.createElement(
      "div",
      { className: "quote-main" },
      React.createElement(
        "section",
        { className: "quote-first-page" },
        badgeSrc
          ? React.createElement(
              "div",
              { className: "quote-badge-first" },
              React.createElement("img", {
                src: badgeSrc,
                alt: "",
                style: { width: "120pt", height: "auto", display: "block" }
              })
            )
          : null,
        React.createElement(
          "div",
          {
            style: {
              ...cellStyle({
                fontWeight: 700,
                textAlign: "center",
                color: "#444",
                margin: badgeSrc ? "14pt 0 10pt 0" : "10pt 0"
              })
            }
          },
          data.quote_title || "Quote"
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16pt",
              margin: "12pt 16pt"
            }
          },
          React.createElement(
            "div",
            {
              style: {
                ...cellStyle({ fontWeight: 700, flex: "1 1 58%", minWidth: 0 }),
                whiteSpace: "pre-wrap"
              }
            },
            leftBlock
          ),
          React.createElement(
            "div",
            {
              style: {
                ...cellStyle({ flex: "1 1 38%", textAlign: "right", minWidth: 0 })
              }
            },
            React.createElement(
              "div",
              { style: { fontWeight: 700, fontSize: "10pt" } },
              data.quote_reference || ""
            ),
            React.createElement(
              "div",
              { style: { fontWeight: 700, marginTop: "4pt" } },
              data.quote_date || ""
            ),
            React.createElement("div", { style: { marginTop: "8pt" } }, data.prepared_by ? `Prepared by: ${data.prepared_by}` : ""),
            React.createElement("div", { style: { marginTop: "4pt", fontSize: "10pt" } }, data.contact ? `Contact: ${data.contact}` : ""),
            data.not_approved
              ? React.createElement(
                  "div",
                  {
                    style: {
                      marginTop: "10pt",
                      display: "inline-block",
                      padding: "4pt 8pt",
                      backgroundColor: C.notApprovedBg,
                      color: C.notApprovedFg,
                      fontWeight: 700
                    }
                  },
                  "NOT APPROVED"
                )
              : null
          )
        ),
        data.letter
          ? React.createElement(
              "div",
              {
                style: {
                  ...cellStyle(),
                  whiteSpace: "pre-wrap",
                  margin: "10pt 20pt 16pt 20pt"
                }
              },
              data.letter
            )
          : null
      ),
      React.createElement(
        "section",
        { className: "quote-body" },
        React.createElement(MainLineItems, { items: data.line_items }),
        React.createElement(TotalsBlock, { totals: data.totals }),
        React.createElement(TermsBlock, { sections: data.terms_sections }),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16pt",
              marginTop: "16pt"
            }
          },
          React.createElement(
            "div",
            { style: { flex: "1 1 65%", minWidth: 0 } },
            React.createElement(PaymentDetailsTable, { payment: data.payment_details })
          ),
          React.createElement(
            "div",
            { style: { flex: "0 0 auto", minWidth: "120pt" } },
            React.createElement(StampBlock, { stamp: data.stamp })
          )
        )
      )
    )
  );
}

module.exports = { QuoteTemplate };
