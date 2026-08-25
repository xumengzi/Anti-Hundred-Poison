// 通用条目清理器：抽取 baidu / bing 的公共逻辑
// - 命中黑名单关键词 或 命中 tpl 白名单 → 隐藏（display:none）而非 remove，可通过 popup 恢复
// - 未命中命中白名单则跳过
// - 未命中但为主容器 → 添加卡片样式
// - 使用 WeakSet 避免 Observer 重复处理

(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});
  const HIDE_ATTR = "data-ahp-hidden";
  const DONE_ATTR = "data-ahp-done";
  let revealMode = false;

  function buildCleaner({
    selector,
    blackReg,
    whiteReg,
    tplList,
    cardStyle,
    isCardTarget,
  }) {
    const processed = new WeakSet();

    return function clean() {
      const list = document.querySelectorAll(selector);
      for (const item of list) {
        if (processed.has(item)) continue;
        processed.add(item);

        const text = item.textContent || "";
        // 白名单优先：命中白名单则保留
        if (whiteReg && whiteReg.test(text)) {
          decorate(item);
          continue;
        }

        const tpl = item.getAttribute && item.getAttribute("tpl");
        const isTpl = tplList && tpl && tplList.includes(tpl);

        if (isTpl || (blackReg && blackReg.test(text))) {
          hide(item);
          continue;
        }

        decorate(item);
      }

      function hide(el) {
        if (revealMode || el.getAttribute(HIDE_ATTR)) return;
        el.setAttribute(HIDE_ATTR, "1");
        el.style.setProperty("display", "none", "important");
        AHP.counter && AHP.counter.add(1);
      }

      function decorate(el) {
        if (!isCardTarget || !cardStyle) return;
        if (!isCardTarget(el)) return;
        if (el.getAttribute(DONE_ATTR)) return;
        el.setAttribute(DONE_ATTR, "1");
        el.setAttribute("style", cardStyle);
      }
    };
  }

  // 临时显示当前页的动态搜索结果；刷新页面后自动恢复净化。
  function unhideAll() {
    revealMode = true;
    const list = document.querySelectorAll("[" + HIDE_ATTR + "]");
    list.forEach((el) => {
      el.style.removeProperty("display");
      el.removeAttribute(HIDE_ATTR);
    });
    if (AHP.counter) AHP.counter.setDynamic(0);
    return list.length;
  }

  function getHiddenCount() {
    return document.querySelectorAll("[" + HIDE_ATTR + "]").length;
  }

  function isRevealMode() {
    return revealMode;
  }

  AHP.cleaner = {
    buildCleaner,
    unhideAll,
    getHiddenCount,
    isRevealMode,
    HIDE_ATTR,
  };
})();
