import type { AnyDeps } from "../types";

/** screens/onboarding. Dependencies: OB_IC, OB_ORDER, PEOPLE, UI, bn, esc, fD, obCands, passCard, passExp, passNo, walletLogo. */
export function createScreensOnboarding(dependencies: AnyDeps) {
  function nidCard(n: string, back?: boolean): string {
    const o = dependencies.UI.onb;
    const P = dependencies.PEOPLE[n] || {
      en: `${o?.first || "Citizen"} ${o?.last || ""}`.trim(),
      bn: `${o?.first || "নাগরিক"} ${o?.last || ""}`.trim(),
      dob: o?.dob || "1996-05-15",
    };
    if (back)
      return `<div class="nidc"><div class="bk">এই কার্ডটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সম্পত্তি। কার্ডটি ব্যবহারকারী ব্যতীত অন্য কোথাও পাওয়া গেলে নিকটস্থ পোস্ট অফিসে জমা দেবার জন্য অনুরোধ করা হলো।<br><b>ঠিকানা:</b> বাসা/হোল্ডিং: ২২, গ্রাম/রাস্তা: উত্তর রাজাশন, ডাকঘর: সাভার, সাভার, ঢাকা<br><b>রক্তের গ্রুপ / Blood Group:</b> B+ &nbsp; <b>প্রদানের তারিখ:</b> ${dependencies.bn("12/05/2018")}</div><div class="bc"></div></div>`;
    return `<div class="nidc"><div class="hd"><span class="em"></span><div><b>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</b><br>Government of the People's Republic of Bangladesh<i>National ID Card / জাতীয় পরিচয় পত্র</i></div></div>
    <div class="nbody"><div class="ph"></div><div class="f">নাম: <b>${dependencies.esc(P?.bn)}</b><br>Name: <b>${dependencies.esc((P?.en ?? "").toUpperCase())}</b><br>পিতা: —<br>মাতা: —<br>Date of Birth: <span style="color:#B91C1C">${dependencies.fD(P?.dob)}</span><br><span class="id">ID NO: ${dependencies.esc(n || o?.nid || "1996123456")}</span></div></div></div>`;
  }
  function obHead(title: string, closeX?: boolean): string {
    return `<div class="ob-h"><button data-act="ob-back" aria-label="${closeX ? "Close" : "Back"}">${closeX ? dependencies.OB_IC.x : dependencies.OB_IC.back}</button>${title}</div>`;
  }
  function obErr(): string {
    return dependencies.UI.onb?.err
      ? `<div class="ob-err" role="alert">${dependencies.esc(dependencies.UI.onb.err)}</div>`
      : "";
  }
  function onbHTML(): string {
    const o = dependencies.UI.onb;
    if (!o) return "";
    const isReg = o.p === "registrar";
    const pi = Math.max(0, dependencies.OB_ORDER.indexOf(o.step)),
      steps = `<div class="ob-steps" aria-hidden="true">${["register", "otp", "password", "start", "confirm", "face"].map((s) => `<i class="${dependencies.OB_ORDER.indexOf(s) <= pi ? "on" : ""}"></i>`).join("")}</div>`;
    switch (o.step) {
      case "register": {
        const c: string[] = dependencies.obCands(o.p);
        return (
          obHead("Register", !o.hist.length) +
          steps +
          `<div class="ob-b"><div class="ob-logo">${dependencies.walletLogo()}</div><div class="ob-t blue">Welcome to OneID</div><div class="ob-s">Please enter your email and phone number to register${isReg ? " as a Marriage Registrar applicant" : ""}.</div>
      <div class="ob-l">Email <i>*</i></div><div class="ob-in">${dependencies.OB_IC.mail}<input type="email" data-ob="email" placeholder="Enter your email" value="${dependencies.esc(o.email)}"></div>
      <div class="ob-l">Phone <i>*</i></div><div class="ob-in"><span class="cc">🇧🇩 +880 ▾</span><input inputmode="tel" data-ob="phone" placeholder="17XXXXXXXX" value="${dependencies.esc(o.phone)}"></div>
      
      <label class="ob-chk"><input type="checkbox" data-obchk="agree" ${o.agree ? "checked" : ""}><span>I agree to the <a href="#" onclick="return false">Terms and Conditions</a> and <a href="#" onclick="return false">Privacy Policy</a></span></label>
      <button class="ob-btn" data-act="ob-reg">Continue</button>${obErr()}
      ${c.length ? `<div class="ob-demo">Quick fill demo person: ${c.map((n) => `<button data-act="ob-demo" data-n="${n}">${dependencies.esc(dependencies.PEOPLE[n]?.en ?? n)}</button>`).join("")}</div>` : ""}
      <div class="ob-small">Already have an account? <button data-act="ob-close">Sign In</button></div></div>`
        );
      }
      case "otp":
        return (
          obHead("Register") +
          steps +
          `<div class="ob-b"><div class="ob-t" style="margin-top:26px">Confirm OTP</div><div class="ob-s">We have just sent you 6 digit code via your email <b>${dependencies.esc(o.email)}</b></div>
      <div class="ob-otp">${[0, 1, 2, 3, 4, 5].map((i) => `<input inputmode="numeric" maxlength="1" data-otp="${i}" value="${dependencies.esc(o.otp[i] || "")}" aria-label="Digit ${i + 1}">`).join("")}</div>
      <button class="ob-btn" data-act="ob-otp" ${o.otp.length === 6 ? "" : "disabled"} id="ob-verify">Verify</button>${obErr()}
      <div class="ob-small" id="ob-resend">Didn't receive code? Resend in <span id="ob-timer">${Math.max(0, 47 - Math.floor((Date.now() - o.sent) / 1000))}</span> s</div>
      <div class="ob-demo">Verification code: <b style="color:#1D4ED8;letter-spacing:2px">${o.code}</b> <button data-act="ob-otpfill">Fill</button></div></div>`
        );
      case "password":
        return (
          obHead("Register") +
          steps +
          `<div class="ob-b"><div class="ob-t" style="margin-top:26px">Enter Password</div><div class="ob-s">Create a password for your OneID account. You will use this email/phone and password to sign in.</div>
      <div class="ob-l">Password <i>*</i></div><div class="ob-flt"><span>Password</span><i class="ic">${dependencies.OB_IC.lock}</i><input type="${o.show1 ? "text" : "password"}" data-ob="pw" value="${dependencies.esc(o.pw)}"><button class="eye" data-act="ob-eye" data-k="show1" aria-label="Show password">${dependencies.OB_IC.eye}</button></div>
      <div class="ob-l">Confirm Password <i>*</i></div><div class="ob-flt"><span>Confirm Password</span><i class="ic">${dependencies.OB_IC.lock}</i><input type="${o.show2 ? "text" : "password"}" data-ob="pw2" value="${dependencies.esc(o.pw2)}"><button class="eye" data-act="ob-eye" data-k="show2" aria-label="Show password">${dependencies.OB_IC.eye}</button></div>
      <p style="font-size:11.5px;color:#6B7A93;margin:8px 0 22px">At least 8 characters.</p>
      <button class="ob-btn" data-act="ob-pw">Save &amp; Continue</button>${obErr()}<div class="ob-demo"><button data-act="ob-pwfill">Quick fill password (Demo@2026)</button></div></div>`
        );
      case "start":
        return (
          obHead("Complete eKYC") +
          steps +
          `<div class="ob-b"><div class="ob-circ">${dependencies.OB_IC.idc}</div><div class="ob-t">Verify Your Identity</div><div class="ob-s">Select your issuing country and document type to begin the secure verification process.</div>
      <div class="ob-card"><div class="ob-l">Document Issuing Country <i>*</i></div><div class="ob-in"><span>🇧🇩</span><select data-ob="country"><option value="BD">Bangladesh</option></select></div>
      <div class="ob-l">Verification Type <i>*</i></div><div class="ob-in">${dependencies.OB_IC.card}<select data-ob="vtype"><option value="NID" ${o.vtype !== "PASSPORT" ? "selected" : ""}>National ID (NID)</option><option value="PASSPORT" ${o.vtype === "PASSPORT" ? "selected" : ""}>Passport</option></select></div></div>
      <button class="ob-btn" data-act="ob-start">Continue</button></div>`
        );
      case "method":
        return (
          obHead("Complete eKYC") +
          steps +
          `<div class="ob-b"><button class="ob-big" data-act="ob-camera">${dependencies.OB_IC.cam} Use Camera for Document Scan</button><div class="ob-or">OR</div>
      <div class="ob-sec">Manual Document Verification</div><div class="ob-s" style="margin-bottom:6px">Enter your NID details (any 10, 13 or 17-digit NID number) and personal information.</div>
      <div class="ob-l">Date of Birth <i>*</i></div><div class="ob-in">${dependencies.OB_IC.cal}<input type="date" data-ob="dob" value="${dependencies.esc(o.dob)}"></div>
      <div class="ob-l">NID Number (10, 13 or 17 digits) <i>*</i></div><div class="ob-in">${dependencies.OB_IC.card}<input inputmode="numeric" data-ob="nid" placeholder="e.g. 1996123456" value="${dependencies.esc(o.nid)}"></div>
      <div class="ob-l">First Name <i>*</i></div><div class="ob-in">${dependencies.OB_IC.user}<input data-ob="first" placeholder="Enter first name" value="${dependencies.esc(o.first)}"></div>
      <div class="ob-l">Last Name <i>*</i></div><div class="ob-in">${dependencies.OB_IC.user}<input data-ob="last" placeholder="Enter last name" value="${dependencies.esc(o.last)}"></div>
      <hr class="ob-hr"><b style="font-size:15px">Verify Your Identity</b><p style="font-size:12px;color:#6B7A93;margin:4px 0 12px">Your verified OneID profile will be saved in browser storage until demo reset.</p>
      <button class="ob-btn ol" data-act="ob-manual">${dependencies.OB_IC.shield} Verify Identity</button>${obErr()}
      <div class="ob-demo">${o.demo && dependencies.PEOPLE[o.demo] ? `<button data-act="ob-manfill">Fill ${dependencies.esc(dependencies.PEOPLE[o.demo].en)}'s NID details</button>` : `<button data-act="ob-manfill">Auto-generate sample NID &amp; details</button>`}</div></div>`
        );
      case "scanFront":
      case "scanBack": {
        const back = o.step === "scanBack";
        return (
          obHead("Complete eKYC") +
          `<div class="ob-cam"><div class="ob-camh"><b>Scan ${back ? "Back" : "Front"} of NID</b><span>Hold document flat and avoid glare ${dependencies.OB_IC.info}</span></div>
      <div class="ob-view"><div class="ob-frame"><span class="ob-cor ctl"></span><span class="ob-cor ctr"></span><span class="ob-cor cbl"></span><span class="ob-cor cbr"></span>${nidCard(o.demo || o.nid, back)}<span class="ob-pill" id="ob-pill">Hold still...</span></div><div class="ob-prog"><i id="ob-bar"></i></div></div></div>`
        );
      }
      case "pmethod":
        return (
          obHead("Complete eKYC") +
          steps +
          `<div class="ob-b"><div class="ob-circ">${dependencies.OB_IC.idc}</div><div class="ob-t">Passport Verification</div><div class="ob-s">Your Bangladesh e-passport is verified in two quick steps. Keep the passport ready and make sure NFC is turned on in your phone.</div>
      <div class="pp-steps"><div class="pp-step"><span>1</span><div><b>Scan the passport data page</b><small>The camera reads the photo page and the machine-readable zone (MRZ).</small></div></div>
      <div class="pp-step"><span>2</span><div><b>Read the passport chip with NFC</b><small>Hold your phone on the passport cover to read and verify the chip data securely.</small></div></div></div>
      <button class="ob-btn" data-act="ob-pscan">${dependencies.OB_IC.cam.replace("<svg", '<svg style="vertical-align:-3px;margin-right:6px"')}Start Passport Scan</button>${obErr()}</div>`
        );
      case "pScan":
        return (
          obHead("Complete eKYC") +
          `<div class="ob-cam"><div class="ob-camh"><b>Scan Passport Data Page</b><span>Open to the photo page, hold flat and avoid glare ${dependencies.OB_IC.info}</span></div>
      <div class="ob-view"><div class="ob-frame" style="aspect-ratio:1.42"><span class="ob-cor ctl"></span><span class="ob-cor ctr"></span><span class="ob-cor cbl"></span><span class="ob-cor cbr"></span>${dependencies.passCard(o.demo || o.nid)}<span class="ob-pill" id="ob-pill">Reading MRZ...</span></div><div class="ob-prog"><i id="ob-bar"></i></div></div></div>`
        );
      case "pNfc":
        return (
          obHead("Complete eKYC") +
          `<div class="nfc-wrap"><div style="font-size:20px;font-weight:600;align-self:flex-start">Read Passport Chip (NFC)</div><p style="font-size:12.5px;color:#6B7A93;margin:4px 0 0;align-self:flex-start">Place the top of your phone on the passport cover and hold still until reading is complete.</p>
      <div class="nfc-art" aria-hidden="true"><div class="nfc-pass"></div><span class="nfc-wave"></span><span class="nfc-wave w2"></span><span class="nfc-wave w3"></span><div class="nfc-phone"></div></div>
      <ul class="nfc-list" id="nfc-list">${["Connecting to passport chip", "Secure access (BAC / PACE)", "Reading personal data (DG1)", "Reading photo (DG2)", "Verifying chip signature"].map((t, i) => `<li data-i="${i}"><i>${i + 1}</i>${t}</li>`).join("")}</ul>
      <div class="nfc-bar"><i id="nfc-bar"></i></div></div>`
        );
      case "confirm":
        return (
          obHead("Complete eKYC") +
          `<div class="ob-b"><div style="font-size:20px;font-weight:600;margin-top:8px">Confirm Your Details</div><p style="font-size:12.5px;color:#6B7A93;margin:4px 0 14px">Please review the extracted information and edit your details if needed before continuing.</p>
      <div class="ob-ex"><h4>Extracted Information</h4>
        <div class="ob-exr"><small>${dependencies.OB_IC.user} First Name</small><div class="ob-in">${dependencies.OB_IC.user}<input data-ob="first" value="${dependencies.esc(o.first)}"></div></div>
        <div class="ob-exr"><small>${dependencies.OB_IC.user} Last Name</small><div class="ob-in">${dependencies.OB_IC.user}<input data-ob="last" value="${dependencies.esc(o.last)}"></div></div>
        <div class="ob-exr"><small>${dependencies.OB_IC.cal} Date of Birth</small><div class="ob-in"><input type="date" data-ob="dob" value="${dependencies.esc(o.dob)}"></div></div>
        ${o.via === "passport" ? `<div class="ob-exr"><small>${dependencies.OB_IC.card} Passport Number</small><b>${dependencies.esc(dependencies.passNo(o.nid))}</b></div><div class="ob-exr"><small>${dependencies.OB_IC.card} Personal No. (NID)</small><div class="ob-in"><input inputmode="numeric" data-ob="nid" value="${dependencies.esc(o.nid)}"></div></div><div class="ob-exr"><small>${dependencies.OB_IC.idc.replace('width="30" height="30"', 'width="14" height="14"')} Nationality · Expiry</small><b>Bangladeshi · ${dependencies.fD(dependencies.passExp())}</b></div><div class="ob-exr"><small>${dependencies.OB_IC.shield} Chip (NFC)</small><b style="color:#1D4ED8">Data read and signature verified ✓</b></div>` : `<div class="ob-exr"><small>${dependencies.OB_IC.card} NID Number</small><div class="ob-in"><input inputmode="numeric" data-ob="nid" value="${dependencies.esc(o.nid)}"></div></div>`}</div>
      <div style="margin-top:auto;padding-top:20px;display:grid;gap:10px"><button class="ob-btn" data-act="ob-confirm">Information Is Correct, Continue</button><button class="ob-btn ol" data-act="ob-rescan">Information Is Incorrect, Rescan</button></div>${obErr()}</div>`
        );
      case "face":
        return `<div class="ob-h" style="background:#fff;justify-content:flex-start"><button data-act="ob-back" aria-label="Back">${dependencies.OB_IC.back.replace("M19 12H5M12 19l-7-7 7-7", "M15 18l-6-6 6-6")}</button></div><div class="ob-cam"><div class="ob-camh" style="text-align:center;padding-top:0"><b>Center Your Face in the Oval</b></div>
      <div class="ob-view" style="background:linear-gradient(180deg,#3A3F48,#2B2F36)"><span class="ob-pill top" id="ob-pill">Stay still...</span><div class="ob-face"></div><div class="ob-prog"><i id="ob-bar"></i></div></div></div>`;
      case "done":
        return `<div class="ob-done">${dependencies.OB_IC.thumb}<h3>Your Account is Verified</h3><p>Your account is saved and ready to use. eKYC is complete, so you won't need it again to eSign${isReg ? " or approve" : ""}. Redirecting now…</p><div class="ob-spin" aria-label="Redirecting"></div></div>`;
    }
    return "";
  }
  return { nidCard, obHead, obErr, onbHTML };
}
