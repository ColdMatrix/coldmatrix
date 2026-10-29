document.addEventListener("DOMContentLoaded", function() {
  if (localStorage.getItem('cookieChoice')) return;

  var banner = document.createElement('div');
  banner.id = 'cookie-notice';
  banner.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:#E8EBEF; border-top:4px solid #D4AF37; padding:15px 20px; text-align:center; z-index:99999; box-shadow:0 -4px 20px rgba(0,0,0,0.7); font-family:\'Inter\',sans-serif;';
  
  banner.innerHTML = `
    <p style="color:#0A0F14; font-size:0.9rem; margin:0 0 10px; line-height:1.6; max-width:800px; margin-left:auto; margin-right:auto; font-weight:600;">We use cookies to improve your experience and serve relevant ads. Read our <a href="privacy-policy.html" style="color:#A07828; text-decoration:underline; font-weight:800;">Privacy Policy</a> and <a href="cookie-policy.html" style="color:#A07828; text-decoration:underline; font-weight:800;">Cookie Policy</a>.</p>
    <button id="cookieAcceptBtn" style="background:#D4AF37; color:#0A0F14; border:2px solid #A07828; padding:10px 24px; border-radius:6px; font-weight:800; cursor:pointer; font-size:0.85rem; margin:0 4px; min-height:44px;">ACCEPT</button>
    <button id="cookieDeclineBtn" style="background:#FFFFFF; color:#0A0F14; border:2px solid #0A0F14; padding:10px 24px; border-radius:6px; font-weight:800; cursor:pointer; font-size:0.85rem; margin:0 4px; min-height:44px;">DECLINE</button>
  `;
  
  document.body.appendChild(banner);

  document.getElementById('cookieAcceptBtn').onclick = function() {
    localStorage.setItem('cookieChoice', 'accepted');
    banner.style.display = 'none';
  };
  
  document.getElementById('cookieDeclineBtn').onclick = function() {
    localStorage.setItem('cookieChoice', 'declined');
    banner.style.display = 'none';
  };
});