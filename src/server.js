const express = require("express");
const puppeteer = require("puppeteer");
const { renderPdfHtml } = require("./pdf/renderHtml");
const { samplePayload } = require("./samplePayload");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

async function optimizePageFit(page) {
  await page.evaluate(async () => {
    const PAGE_HEIGHT_PX = 1046;
    const TINY_OVERFLOW_PX = 42;
    const root = document.getElementById("pdf-root");
    if (!root) return;
    const docEl = document.documentElement;

    const getMetrics = () => {
      const height = Math.ceil(root.getBoundingClientRect().height);
      const pages = Math.ceil(height / PAGE_HEIGHT_PX);
      const remainder = height - (pages - 1) * PAGE_HEIGHT_PX;
      return { height, pages, remainder };
    };

    const applyAdaptiveFit = () => {
      const initial = getMetrics();
      if (initial.pages <= 1) return;

      const overflow = PAGE_HEIGHT_PX - initial.remainder;
      if (overflow <= 0 || overflow > TINY_OVERFLOW_PX) return;

      const fontSizes = [15.8, 15.6, 15.4, 15.2, 15.0, 14.8, 14.6];
      docEl.classList.add("pdf-compact");
      for (const size of fontSizes) {
        docEl.style.fontSize = size + "px";
        const next = getMetrics();
        if (next.pages < initial.pages) {
          return;
        }
      }

      // Revert if compact mode didn't solve tiny overflow.
      docEl.classList.remove("pdf-compact");
      docEl.style.fontSize = "";
    };

    const images = Array.from(document.images || []);
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    );

    applyAdaptiveFit();
  });
}

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

app.get("/", (_req, res) => {
  res.sendFile("index.html", { root: "public" });
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
    await optimizePageFit(page);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px"
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
    await optimizePageFit(page);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px"
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="report.pdf"');
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
