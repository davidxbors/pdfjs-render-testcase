(function () {
  var L = [];
  function w(s){ L.push(s); document.documentElement.innerHTML =
    "<pre style='font:11px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:6px'>"
    + "=== CROSS-ORIGIN IFRAME -> BRIDGE ===\ntop origin: " + location.origin + "\n\n" + L.join("\n") + "</pre>"; }
  w("(waiting for iframe)");
  window.addEventListener("message", function (e) {
    if (typeof e.data === "string" && e.data.indexOf("IFRAME|") === 0)
      w("[" + e.origin + "] " + e.data.slice(7));
  });
  var f = document.createElement("iframe");
  f.src = "https://davidxbors.github.io/pdfjs-render-testcase/frame.html";
  f.style = "width:100%;height:120px;border:2px solid red";
  document.body.appendChild(f);
})();
