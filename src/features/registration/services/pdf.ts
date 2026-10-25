import type { AnyDeps, ApplicationRecord } from "../types";

interface PdfDownloader {
  save(opts: { filename: string; data: Blob }): Promise<void>;
}

/** services/pdf. Dependencies: $, certHTML, docHTML, hydrateQR, lifecycle, toast. */
export function createServicesPdf(dependencies: AnyDeps) {
  let dlP: Promise<PdfDownloader | null> | null = null;
  const browserDownloader: PdfDownloader = {
    async save({ filename, data }) {
      const url = URL.createObjectURL(data);
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    },
  };
  const dlCap = (): Promise<PdfDownloader | null> =>
    dlP ||
    (dlP =
      window.claude && typeof window.claude.use === "function"
        ? window.claude
            .use("downloads")
            .then((dl) => dl || browserDownloader)
            .catch(() => browserDownloader)
        : Promise.resolve(browserDownloader));
  async function downloadPdf(a: ApplicationRecord, kind?: string): Promise<void> {
    const isC = kind === "cert" && a.cert;
    if (typeof html2canvas !== "function" || !window.jspdf) {
      dependencies.toast("The PDF tools didn't load. Check your connection.");
      return;
    }
    const dl = await dlCap();
    if (!dl) {
      dependencies.toast("Downloads aren't available in this view.");
      return;
    }
    dependencies.toast("Preparing PDF…");
    const st = dependencies.$("#pdfStage") as HTMLElement | null;
    if (!st) return;
    st.innerHTML = isC ? dependencies.certHTML(a) : dependencies.docHTML(a);
    dependencies.hydrateQR(st);
    try {
      await document.fonts.ready;
    } catch {
      /* ignore font loading error */
    }
    await new Promise<void>((r) => dependencies.lifecycle.timeout(r, 150));
    try {
      const cv = await html2canvas(st.firstElementChild, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const pdf = new window.jspdf.jsPDF({ unit: "pt", format: "a4" });
      const pw = pdf.internal.pageSize.getWidth(),
        ph = pdf.internal.pageSize.getHeight(),
        ih = (cv.height * pw) / cv.width,
        img = cv.toDataURL("image/jpeg", 0.92);
      let y = 0,
        first = true;
      while (y < ih) {
        if (!first) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, -y, pw, ih);
        y += ph;
        first = false;
      }
      st.innerHTML = "";
      await dl.save({
        filename:
          isC && a.cert
            ? `Marriage_Certificate_${a.cert.sn}.pdf`
            : `Digital_Nikahnama_${a.issued ? a.issued.regNo : a.appNo}.pdf`,
        data: pdf.output("blob"),
      });
      dependencies.toast("PDF saved");
    } catch (e: unknown) {
      st.innerHTML = "";
      if (e && typeof e === "object" && "code" in e && e.code === "declined") return;
      dependencies.toast("The PDF couldn't be saved here.");
    }
  }
  return {
    get dlP() {
      return dlP;
    },
    set dlP(value) {
      dlP = value;
    },
    dlCap,
    downloadPdf,
  };
}
