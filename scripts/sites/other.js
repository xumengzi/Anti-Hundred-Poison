// so.com / sogou.com：原逻辑只做静态隐藏，已由 styles/hide.css 完成
// 这里保留一个占位以便未来扩展（例如加动态清理）
(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});
  AHP.sites = AHP.sites || {};
  AHP.sites.so = function noop() {};
  AHP.sites.sogou = function noop() {};
})();
