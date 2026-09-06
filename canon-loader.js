/* One-file loader for the externally hosted Canon List. */
(function () {
  'use strict';

  var script = document.currentScript;
  if (!script || !script.src) return;

  var scriptUrl = new URL(script.src, window.location.href);
  var versionQuery = scriptUrl.search || '';
  var base = scriptUrl.href.split('?')[0].replace(/[^/]+$/, '');
  var target = document.getElementById('canon-directory');

  function showError(message) {
    if (target) {
      target.innerHTML = '<div class="canonLoadError">Canon List could not load: ' + message + '</div>';
    }
  }

  function addCss(url) {
    if (document.querySelector('link[data-canon-list-css]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-canon-list-css', '1');
    document.head.appendChild(link);
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = url;
      s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('failed to load ' + url)); };
      document.head.appendChild(s);
    });
  }

  addCss(base + 'canon-list.css' + versionQuery);

  loadScript(base + 'canon-data.js' + versionQuery)
    .then(function () { return loadScript(base + 'canon-list.js' + versionQuery); })
    .catch(function (err) {
      showError(err && err.message ? err.message : 'unknown error');
      if (window.console && console.error) console.error(err);
    });
})();
