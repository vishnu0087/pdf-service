const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { PdfTemplate } = require("./template.jsx");

const tailwindCdn = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";

function renderPdfHtml(payload) {
  const bodyMarkup = ReactDOMServer.renderToStaticMarkup(
    React.createElement(PdfTemplate, { data: payload })
  );

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="${tailwindCdn}"></script>
        <style>
          @page { size: A4; margin: 0; }
          html { font-size: 16px; }
          body {
            font-family: Inter, Segoe UI, Roboto, Arial, sans-serif;
            background: #ffffff;
            margin: 0;
          }
          #pdf-root {
            width: 100%;
          }
          .pdf-keep-together {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          p, li, td, th, figcaption {
            orphans: 3;
            widows: 3;
          }
          html.pdf-compact .mt-8 { margin-top: 1.1rem !important; }
          html.pdf-compact .mt-6 { margin-top: 0.8rem !important; }
          html.pdf-compact .p-8 { padding: 1.1rem !important; }
          html.pdf-compact .p-4 { padding: 0.65rem !important; }
          html.pdf-compact .p-3 { padding: 0.5rem !important; }
          html.pdf-compact th,
          html.pdf-compact td { padding-top: 0.4rem !important; padding-bottom: 0.4rem !important; }
        </style>
      </head>
      <body>
        <div id="pdf-root">${bodyMarkup}</div>
      </body>
    </html>
  `;
}

module.exports = { renderPdfHtml };
