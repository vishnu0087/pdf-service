const path = require("path");
const express = require("express");
const puppeteer = require("puppeteer");
const { renderPdfHtml } = require("./pdf/renderHtml");
const { normalizeQuotePayload } = require("./pdf/quoteNormalize");
const samplePayload = require("./sample-data.json");

const app = express();
const PORT = process.env.PORT || 4000;
const PUBLIC_DIR = path.join(__dirname, "..", "public");

app.use(express.json({ limit: "10mb" }));
app.use(express.static(PUBLIC_DIR));

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "pdf-service",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/pdf/sample-data", (_req, res) => {
  res.json(samplePayload);
});

app.get("/api", (_req, res) => {
  res.json({
    service: "pdf-service",
    endpoints: {
      health: "GET /health",
      sampleData: "GET /api/pdf/sample-data",
      render: "POST /api/pdf/render",
      download: "POST /api/pdf/download"
    }
  });
});

app.post("/api/pdf/render", async (req, res) => {
  let browser;

  try {
    const payload = req.body;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. Please send a JSON object."
      });
    }

    const html = renderPdfHtml(payload);

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0"
      }
    });

    return res.json({
      success: true,
      message: "PDF generated successfully.",
      pdfBase64: pdfBuffer.toString("base64")
    });
  } catch (error) {
    console.error("PDF render error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF.",
      error: error.message
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.post("/api/pdf/download", async (req, res) => {
  let browser;

  try {
    const payload = req.body;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. Please send a JSON object."
      });
    }

    const html = renderPdfHtml(payload);

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0"
      }
    });

    const outName = normalizeQuotePayload(payload)?.original_filename || "quote.pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${outName.replace(/[^a-zA-Z0-9._-]/g, "_")}"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF download error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download PDF.",
      error: error.message
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`PDF service is running on http://localhost:${PORT}`);
});
