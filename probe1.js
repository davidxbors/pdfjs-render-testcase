// In-app WebView capability probe. No account data is read or sent.
(function () {
  var out = [];
  function add(k, v) { out.push(k + ": " + v); }

  add("origin", location.origin);
  add("href", location.href.slice(0, 120));
  add("UA", navigator.userAgent);

  // Native JS interfaces injected by the app are own properties of window that
  // are not present in a normal browser. Bybit's bridge names are _b_bridge_<Module>_.
  var names = [];
  try {
    for (var k in window) { if (/_b_bridge_|_qabridge|bridge|_bit_|Android/i.test(k)) names.push(k); }
  } catch (e) { names.push("ERR:" + e); }
  add("bridge-ish window keys", names.join(" | ") || "(none)");

  // Direct probe of the documented modules from the static inventory.
  var mods = ["Router","Navigator","NavigationBar","Loading","SystemInfo","UrlLauncher",
              "Login","Share","QrScanner","Express","FiatDeposit","AlertDialog",
              "Performance","AppletWebViewService","LegoService","XLab","QABridge"];
  var found = [];
  mods.forEach(function (m) {
    var o = window["_b_bridge_" + m + "_"];
    if (o) found.push(m + "(" + typeof o + "," + (typeof o.postMessage) + ")");
  });
  add("bridge modules present", found.join(" ") || "(none)");

  var render = "<pre style='font:14px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:8px'>"
    + "=== BYBIT IN-APP WEBVIEW PROBE ===\n" + out.join("\n\n") + "</pre>";
  document.documentElement.innerHTML = render;
  document.title = "PROBE-" + document.domain;
})();
