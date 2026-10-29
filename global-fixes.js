/* ===== 1. PREMIUM SILVER COOKIE BANNER ===== */
#cookie-notice {
  position: fixed !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 95% !important;
  max-width: 900px !important;
  background: #E8EBEF !important;
  border: 2px solid #D4AF37 !important;
  border-radius: 12px !important;
  padding: 18px 24px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6) !important;
  z-index: 99999 !important;
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 15px !important;
  font-family: 'Inter', sans-serif !important;
}
#cookie-notice p {
  color: #0A0F14 !important;
  font-size: 0.9rem !important;
  font-weight: 600 !important;
  line-height: 1.5 !important;
  margin: 0 !important;
  text-align: center !important;
  width: 100% !important; /* Forces buttons to a new line if text is long */
}
#cookie-notice a { color: #A07828 !important; text-decoration: underline !important; }
#cookieAcceptBtn, #cookieDeclineBtn {
  padding: 10px 30px !important;
  font-weight: 800 !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  font-size: 0.85rem !important;
  min-width: 120px !important;
  display: inline-block !important;
}
#cookieAcceptBtn { background: #D4AF37 !important; color: #0A0F14 !important; border: 2px solid #A07828 !important; }
#cookieDeclineBtn { background: #FFFFFF !important; color: #0A0F14 !important; border: 2px solid #0A0F14 !important; }


/* ===== 2. FIX COLD STORE & SANDWICH CALCULATOR BACKGROUNDS ===== */
.edu-section, .coldmatrix-note, .local-bridge {
  background-color: #E8EBEF !important;
  color: #0A0F14 !important;
  padding: 24px !important;
  border: 2px solid #D4AF37 !important;
  border-radius: 12px !important;
  margin: 0 auto 24px auto !important; /* Centers the box and adds bottom margin */
  width: 95% !important; /* GIVES IT BREATHING ROOM ON THE SIDES */
  max-width: 95% !important;
  box-sizing: border-box !important;
  overflow-wrap: break-word !important;
}
.edu-section h2, .edu-section h3, .edu-section p, .edu-section li, .coldmatrix-note, .local-bridge p {
  color: #0A0F14 !important;
}


/* ===== 3. FIX INSTALL BUTTON (Make it a slim smart bar) ===== */
.install-bar, #cmInstallBar {
  width: 90% !important;
  max-width: 500px !important;
  margin: 20px auto !important;
  padding: 8px 16px !important; /* Reduced padding to make it slimmer */
  border-radius: 10px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  box-sizing: border-box !important;
}

/* Make the actual INSTALL button inside it smaller and sleek */
.install-bar button, #cmInstallBar button {
  padding: 6px 14px !important;
  font-size: 0.85rem !important;
  margin-left: 8px !important;
  border-radius: 6px !important;
}