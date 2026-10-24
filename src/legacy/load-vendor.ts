// Third-party libraries the portal engines expect on `window` (QRCode, html2canvas, jspdf).
const VENDOR_SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
];

function loadScript(src: string) {
  return new Promise<void>((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // engines degrade gracefully without PDF/QR
    document.head.appendChild(s);
  });
}

export function loadVendorScripts() {
  return Promise.all(VENDOR_SCRIPTS.map(loadScript));
}
