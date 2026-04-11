const fs = require("fs");
const path = require("path");

const RESOURCE_DIR = path.join(__dirname, "..", "..", "resource");

const IMAGE_FILES = {
  background: "pdf-background.png",
  notApprovedBadge: "not_approved.png",
  notApprovedStamp: "not_approved_stamp.png",
  productPlaceholder: "not_approved.png",
  qrPlaceholder: "not_approved.png"
};

const PATH_ALIASES = {
  "private/cache/24-03-02-18-19-5023-12-23-10-11-59pdf-background-1.png": "background",
  "private/assets/not_approved.png": "notApprovedBadge",
  "private/cache/63d66f86-3365-4043-89cb-bb4a54601270.png": "productPlaceholder",
  "private/cache/77fd25e3-5495-4dc4-8968-36f414cf2adb.png": "qrPlaceholder",
  "private/assets/not_approved_stamp.png": "notApprovedStamp"
};

function readPngDataUrl(fileKey) {
  const name = IMAGE_FILES[fileKey];
  if (!name) return "";
  const full = path.join(RESOURCE_DIR, name);
  if (!fs.existsSync(full)) return "";
  const buf = fs.readFileSync(full);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const cache = {};

function getDataUrlForPdfmakeImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";
  const key = PATH_ALIASES[imagePath];
  if (!key) return "";
  if (!cache[key]) {
    cache[key] = readPngDataUrl(key);
  }
  return cache[key];
}

function getBackgroundDataUrl() {
  return readPngDataUrl("background");
}

/** Direct asset keys: productPlaceholder | notApprovedBadge | notApprovedStamp | qrPlaceholder */
function getAssetDataUrl(assetKey) {
  if (!assetKey || typeof assetKey !== "string") return "";
  if (!IMAGE_FILES[assetKey]) return "";
  if (!cache[assetKey]) {
    cache[assetKey] = readPngDataUrl(assetKey);
  }
  return cache[assetKey];
}

module.exports = {
  RESOURCE_DIR,
  getDataUrlForPdfmakeImagePath,
  getBackgroundDataUrl,
  getAssetDataUrl,
  IMAGE_FILES
};
