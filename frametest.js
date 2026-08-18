(function () {
  var L = [];
  function w(s){ L.push(s); document.documentElement.innerHTML =
    "<pre style='font:10px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:6px'>"
    + "=== IFRAME -> BRIDGE AUTHORISATION TEST ===\ntop: " + location.origin + "\n\n" + L.join("\n") + "</pre>"; }
  // The Dart side answers with evaluateJavascript, which lands in the MAIN frame.
  // Catch it here so we can see whether the iframe's call was honoured.
  window._b_bridge_callback_ = function (o) {
    try { var d = (typeof o === "string") ? JSON.parse(o) : o;
      w("*** MAIN-FRAME CALLBACK: " + d.moduleName + "." + d.methodName +
        " uniqueId=" + d.uniqueId +
        " userToken=" + (d.params && d.params.userToken ? d.params.userToken.slice(0,50)+"..." : "(none)")); }
    catch (e) { w("cb parse err " + e); }
  };
  window.invokeCallback = window._b_bridge_callback_;
  w("(main frame listening; uniqueId prefix 'if' == the IFRAME made the call)");
  window.addEventListener("message", function (e) {
    if (typeof e.data === "string" && e.data.indexOf("IFRAME|") === 0) w("[iframe] " + e.data.slice(7));
  });
  var f = document.createElement("iframe");
  f.src = "https://davidxbors.github.io/pdfjs-render-testcase/frame.html";
  f.style = "width:100%;height:70px;border:2px solid red";
  document.body.appendChild(f);
})();
