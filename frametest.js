(function () {
  // NOTE: never touch documentElement.innerHTML here, it tears down the iframe.
  document.body.innerHTML = "";
  var pre = document.createElement("pre");
  pre.style = "font:10px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:6px";
  document.body.appendChild(pre);
  var L = [];
  function w(s){ L.push(s); pre.textContent = "=== IFRAME -> BRIDGE ACTION TEST ===\ntop: " + location.origin + "\n\n" + L.join("\n"); }
  window._b_bridge_callback_ = function (o) {
    try { var d = (typeof o === "string") ? JSON.parse(o) : o;
      w("MAIN-FRAME CALLBACK " + d.moduleName + "." + d.methodName + " uniqueId=" + d.uniqueId + " code=" + d.code); }
    catch (e) { w("cb err " + e); }
  };
  window.invokeCallback = window._b_bridge_callback_;
  w("(main frame listening, iframe kept alive)");
  window.addEventListener("message", function (e) {
    if (typeof e.data === "string" && e.data.indexOf("IFRAME|") === 0) w("[iframe] " + e.data.slice(7));
  });
  var f = document.createElement("iframe");
  f.src = "https://davidxbors.github.io/pdfjs-render-testcase/frame.html?cb=" + Math.random();
  f.style = "width:100%;height:60px;border:2px solid red";
  document.body.appendChild(f);
})();
