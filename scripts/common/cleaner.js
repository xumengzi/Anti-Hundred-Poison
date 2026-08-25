// 通用条目清理器：抽取 baidu / bing 的公共逻辑
// - 命中黑名单关键词或命中 tpl 列表时隐藏，可通过 popup 临时恢复
// - 白名单优先，内容改变或翻页复用节点时会重新检查
// - 未命中的主容器添加卡片样式

(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});
  const HIDE_ATTR = "data-ahp-hidden";
  const DONE_ATTR = "data-ahp-done";
  let revealMode = false;
  let evaluationGeneration = 0;

  function buildCleaner({
    selector,
    blackReg,
    whiteReg,
    tplList,
    cardStyle,
    isCardTarget,
  }) {
    const signatures = new WeakMap();

    return function clean() {
      document.querySelectorAll("[" + HIDE_ATTR + "]").forEach((item) => {
        if (!item.matches(selector)) show(item);
      });

      const list = document.querySelectorAll(selector);
      for (const item of list) {
        const text = item.textContent || "";
        const tpl = item.getAttribute && item.getAttribute("tpl");
        const signature = `${evaluationGeneration}\u0000${tpl || ""}\u0000${item.className || ""}\u0000${text}`;
        if (signatures.get(item) === signature) continue;
        signatures.set(item, signature);

        // 白名单优先：命中白名单则保留。
        if (whiteReg && whiteReg.test(text)) {
          show(item);
          decorate(item);
          continue;
        }

        const isTpl = tplList && tpl && tplList.includes(tpl);
        if (isTpl || (blackReg && blackReg.test(text))) {
          hide(item);
          continue;
        }

        show(item);
        decorate(item);
      }

      if (AHP.counter) AHP.counter.setDynamic(getHiddenCount());

      function hide(el) {
        if (revealMode || el.getAttribute(HIDE_ATTR)) return;
        el.setAttribute(HIDE_ATTR, "1");
        el.style.setProperty("display", "none", "important");
      }

      function show(el) {
        if (!el.getAttribute(HIDE_ATTR)) return;
        el.style.removeProperty("display");
        el.removeAttribute(HIDE_ATTR);
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

  function resetRevealMode(forceRecheck = false) {
    if (!revealMode && !forceRecheck) return;
    revealMode = false;
    evaluationGeneration += 1;
  }

  AHP.cleaner = {
    buildCleaner,
    unhideAll,
    getHiddenCount,
    isRevealMode,
    resetRevealMode,
    HIDE_ATTR,
  };
})();
