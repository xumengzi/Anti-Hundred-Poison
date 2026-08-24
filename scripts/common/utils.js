// 工具函数集合：轻量、无副作用
// 用 IIFE 挂到 window.__AHP__ 命名空间，避免污染全局

(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});

  // 转义正则元字符
  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // 由关键词数组构建一个正则（一次匹配代替 N 次 includes）
  function buildKeywordRegExp(keys) {
    if (!keys || !keys.length) return null;
    return new RegExp(keys.map(escapeRegExp).join("|"), "i");
  }

  // requestAnimationFrame 节流
  function rafThrottle(fn) {
    let scheduled = false;
    return function throttled() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        fn();
      });
    };
  }

  // DOM 就绪
  function onReady(cb) {
    if (
      document.readyState === "interactive" ||
      document.readyState === "complete"
    ) {
      cb();
    } else {
      document.addEventListener("DOMContentLoaded", cb, { once: true });
    }
  }

  // 通过扩展协议读取打包内的 JSON 资源
  async function loadJSON(path) {
    const url = chrome.runtime.getURL(path);
    const res = await fetch(url);
    if (!res.ok) throw new Error("load " + path + " failed: " + res.status);
    return res.json();
  }

  AHP.utils = {
    escapeRegExp,
    buildKeywordRegExp,
    rafThrottle,
    onReady,
    loadJSON,
  };
})();
