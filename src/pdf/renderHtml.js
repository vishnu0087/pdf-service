const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { QuoteTemplate } = require("./quoteTemplate.jsx");
const { normalizeQuotePayload } = require("./quoteNormalize");
const { getBackgroundDataUrl } = require("./assetUrls");

const TAILWIND_BUNDLE = path.join(__dirname, "pdf-tailwind.css");

function loadTailwindCss() {
  try {
    return fs.readFileSync(TAILWIND_BUNDLE, "utf8");
  } catch {
    console.warn("pdf-tailwind.css not found. Run: npm run build:css");
    return "";
  }
}

function renderPdfHtml(payload) {
  const data = normalizeQuotePayload(payload);
  if (!data) {
    throw new Error(
      "Invalid payload. Use simple quote JSON (see src/sample-data.json). Legacy pdfmake docDefinition format is not supported."
    );
  }

  const bgUrl = getBackgroundDataUrl();
  const tailwindCss = loadTailwindCss();
  const bodyMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(QuoteTemplate, { data })
  );

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <style>
${tailwindCss}
        </style>
        <style>
          @page { size: A4; margin: 0; }
          html { font-size: 16px; }
          body {
            font-family: "Montserrat", Segoe UI, Roboto, Arial, sans-serif;
            margin: 0;
            min-height: 100vh;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #pdf-root {
            width: 100%;
            position: relative;
            z-index: 0;
          }
          .pdf-background-layer {
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 595pt;
            height: 100%;
            background-image: ${bgUrl ? `url(${JSON.stringify(bgUrl)})` : "none"};
            background-size: 595pt auto;
            background-repeat: repeat-y;
            background-position: top center;
            z-index: -1;
            pointer-events: none;
          }
          .quote-doc {
            font-size: 10pt;
            line-height: 1.35;
          }
          .quote-main {
            box-sizing: border-box;
            padding: 100pt 32pt 60pt 24pt;
            max-width: 100%;
          }
          .quote-first-page {
            position: relative;
            page-break-after: always;
            break-after: page;
          }
          .quote-badge-first {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 2;
            pointer-events: none;
          }
          .quote-body {
            position: relative;
            z-index: 1;
          }
          .quote-table-main td,
          .quote-table-main th {
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          p, li, td, th {
            orphans: 2;
            widows: 2;
          }
        </style>
      </head>
      <body>
        <div class="pdf-background-layer"></div>
        <div id="pdf-root">${bodyMarkup}</div>
      </body>
    </html>
  `;
}

module.exports = { renderPdfHtml, normalizeQuotePayload };
