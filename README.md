# PDF Service

Node.js PDF generation using Puppeteer, React, and Tailwind CSS. The API accepts **plain quote JSON** (no pdfmake) and renders a fixed layout aligned with `resource/Quote.pdf`.

## Features

- **Express API** for PDF generation and download
- **Puppeteer** for print output
- **React SSR** for the quote template
- **Tailwind CSS v4** (built bundle) for utilities
- **Constant 10pt body typography** (no automatic shrinking)
- **First page only**: “not approved” badge, top-left inside the safe content area
- **Background** graphic repeated per page; content padded so it does not sit under the header/footer artwork

## Quick Start

```bash
npm install
npm run build:css
npm start
```

Open **`http://localhost:4000`** and use **Download PDF**.

## API

- `GET /` — Web UI
- `GET /api/pdf/sample-data` — Example JSON
- `POST /api/pdf/download` — Request body = quote JSON → PDF file
- `POST /api/pdf/render` — Same body → `{ pdfBase64 }`

## Data format (simple JSON)

See **`src/sample-data.json`**. Top-level keys include:

| Key | Role |
|-----|------|
| `customer_name`, `customer_address`, `customer_phone`, `customer_email` | Customer block |
| `quote_title`, `quote_reference`, `quote_date`, `prepared_by`, `contact` | Header right |
| `not_approved` | If true, shows badge (first page only) + red “NOT APPROVED” label |
| `letter` | Intro letter (page 1, then break before the main table) |
| `line_items` | Rows: `{ "type": "label" \| "product" \| "spacer", ... }` |
| `totals` | `{ label, value, bold? }[]` |
| `terms_sections` | `{ title, items: string[] }[]` |
| `payment_details` | `{ title, rows: [[cell, cell], ...] }` — cells: `{ text }`, `{ image, width }`, optional `colspan` / `rowspan` |
| `stamp` | `{ show, image, width, height }` |
| `original_filename` | Suggested download name |

**Images**: use `product_placeholder`, `qr_placeholder`, `not_approved_stamp` (see `src/pdf/assetUrls.js`).

Legacy **`docDefinition`** payloads are **not** supported.

## Development

```bash
npm run dev
npm run build:css
```

## Assets (`resource/`)

- `pdf-background.png` — Page background
- `not_approved.png` — Badge (first page)
- `not_approved_stamp.png` — Stamp (footer area)
