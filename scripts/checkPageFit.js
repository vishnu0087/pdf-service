const { PDFDocument } = require("pdf-lib");

function makePayload(itemCount) {
  return {
    documentTitle: "Sales Report",
    companyName: "Acme Solutions Pvt. Ltd.",
    reference: `SR-TEST-${itemCount}`,
    generatedAt: new Date().toISOString(),
    clientName: "Vishnu Kumar",
    clientEmail: "vishnu@example.com",
    clientPhone: "+91-9876543210",
    clientAddress: "Bengaluru, India",
    currency: "INR",
    items: Array.from({ length: itemCount }, (_, i) => ({
      description: `Item ${i + 1} - Service line description`,
      quantity: 1,
      unitPrice: 1000 + i
    })),
    notes: "Page-fit check payload",
    footerLeft: "System generated document",
    footerRight: "PDF Service"
  };
}

async function fetchPdf(itemCount) {
  const res = await fetch("http://localhost:4000/api/pdf/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(makePayload(itemCount))
  });
  if (!res.ok) throw new Error(`Request failed for ${itemCount} items`);
  return Buffer.from(await res.arrayBuffer());
}

async function pageCount(buffer) {
  const doc = await PDFDocument.load(buffer);
  return doc.getPageCount();
}

async function run() {
  const countsToTry = [30, 32, 34, 36, 38, 40, 42, 44];
  for (const count of countsToTry) {
    const pdf = await fetchPdf(count);
    const pages = await pageCount(pdf);
    console.log(`${count} items -> ${pages} page(s)`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
