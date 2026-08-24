// 计数上报：给 background 汇报本 tab 的屏蔽数
// 分两类：
//   dynamic: content script 主动隐藏/移除的搜索结果条目数
//   static : 由 styles/hide.css 静态隐藏的页面元素数量（例如右侧栏/热搜/顶栏等）
// popup 展示 total = dynamic + static

(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});
  let dynamic = 0;
  let staticCount = 0;
  let pending = false;

  function flush() {
    pending = false;
    try {
      chrome.runtime.sendMessage({
        type: "AHP_COUNT",
        count: dynamic + staticCount,
        dynamic,
        staticCount,
      });
    } catch (_) {
      // service worker 可能未就绪，忽略
    }
  }

  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(flush, 100);
  }

  function add(n = 1) {
    dynamic += n;
    schedule();
  }

  function setStatic(n) {
    staticCount = n | 0;
    schedule();
  }

  function get() {
    return { total: dynamic + staticCount, dynamic, staticCount };
  }

  AHP.counter = { add, setStatic, get };
})();
