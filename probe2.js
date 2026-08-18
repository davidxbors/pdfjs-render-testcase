// Bridge capability probe. Runs as https://www.bybit.com inside the app WebView.
(function () {
  var log = [];
  var cbs = [];
  // Capture async callbacks the app pushes back into the page.
  window._b_bridge_callback_ = function () { cbs.push("_b_bridge_callback_ " + JSON.stringify([].slice.call(arguments)).slice(0, 600)); render(); };
  window.invokeCallback = function () { cbs.push("invokeCallback " + JSON.stringify([].slice.call(arguments)).slice(0, 600)); render(); };

  var uid = 0;
  function call(mod, method, params) {
    var msg = JSON.stringify({ moduleName: mod, methodName: method, uniqueId: "p" + (++uid), params: params || {} });
    try {
      return window.flutter_inappwebview.callHandler("_b_bridge_" + mod + "_", msg)
        .then(function (r) { return "OK " + JSON.stringify(r).slice(0, 900); })
        .catch(function (e) { return "ERR " + e; });
    } catch (e) { return Promise.resolve("THROW " + e); }
  }

  var probes = [
    ["SystemInfo", "getAppConfig", {}],
    ["SystemInfo", "getApiMap", {}],
    ["SystemInfo", "getTextFromClipboard", {}],
    ["UserProfile", "getUserProfile", {}],
    ["UserProfile", "cachedUserProfile", {}],
    ["Navigator", "getUrl", {}],
    ["login", "needLogin", {}],
    ["SystemInfo", "__nope__", {}]
  ];

  function render() {
    document.documentElement.innerHTML =
      "<pre style='font:11px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:6px'>"
      + "=== BRIDGE PROBE ===\n" + log.join("\n") + "\n--- callbacks ---\n" + cbs.join("\n") + "</pre>";
  }
  render();

  probes.reduce(function (p, spec) {
    return p.then(function () {
      return call(spec[0], spec[1], spec[2]).then(function (res) {
        log.push("[" + spec[0] + "." + spec[1] + "] " + res);
        render();
      });
    });
  }, Promise.resolve()).then(function () {
    // raw dev handlers
    return window.flutter_inappwebview.callHandler("_qabridge_svc_", "{}")
      .then(function (r) { log.push("[_qabridge_svc_] OK " + JSON.stringify(r).slice(0, 400)); })
      .catch(function (e) { log.push("[_qabridge_svc_] ERR " + e); })
      .then(render);
  });
})();
