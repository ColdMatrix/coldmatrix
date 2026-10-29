document.addEventListener("DOMContentLoaded", function() {
  if (!document.getElementById('cookie-notice')) {
    var banner = document.createElement('div');
    banner.id = 'cookie-notice';
    banner.innerHTML = `
      <p>We use cookies to improve your experience and serve relevant ads. Read our <a href="privacy-policy.html">Privacy Policy</a> and <a href="cookie-policy.html">Cookie Policy</a>.</p>
      <div style="display:flex; gap:10px; margin-top:10px;">
        <button id="cookieAcceptBtn">ACCEPT</button>
        <button id="cookieDeclineBtn">DECLINE</button>
      </div>
    `;
    document.body.appendChild(banner);
    var choice = localStorage.getItem('cookieChoice');
    var choiceTime = localStorage.getItem('cookieTime');
    var now = Date.now();
    var sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (choice && choiceTime && (now - parseInt(choiceTime)) < sevenDays) {
      banner.style.display = 'none';
    }
    document.getElementById('cookieAcceptBtn').onclick = function() {
      localStorage.setItem('cookieChoice', 'accepted');
      localStorage.setItem('cookieTime', now);
      location.reload();
    };
    document.getElementById('cookieDeclineBtn').onclick = function() {
      localStorage.setItem('cookieChoice', 'declined');
      localStorage.setItem('cookieTime', now);
      banner.style.display = 'none';
    };
  }
});
