// 百度站点适配
(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});

  AHP.sites = AHP.sites || {};
  AHP.sites.baidu = function run(ctx) {
    const { rules, selectors, blackReg, whiteReg } = ctx;

    const clean = AHP.cleaner.buildCleaner({
      selector: selectors.resultSelectors.baidu,
      blackReg,
      whiteReg,
      tplList: rules.tpl,
      cardStyle: selectors.cardStyle.baidu,
      isCardTarget: (el) => el.classList.contains("c-container"),
    });

    function removeParents() {
      const parents = selectors.hide.removeParent || [];
      parents.forEach((sel) => {
        document.querySelectorAll(sel).forEach((item) => {
          const p = item.parentNode;
          if (p && p instanceof HTMLElement) p.style.display = "none";
        });
      });
    }

    clean();
    removeParents();

    const throttled = AHP.utils.rafThrottle(() => {
      clean();
      removeParents();
    });

    // 百度翻页可能整体替换结果容器，因此监听稳定的文档根节点。
    // 同时处理复用卡片的文本更新，并在同文档导航后恢复默认净化状态。
    const target = document.documentElement;
    if (!target) return;

    let lastUrl = location.href;
    const observer = new MutationObserver((list) => {
      const urlChanged = location.href !== lastUrl;
      if (urlChanged) {
        lastUrl = location.href;
        AHP.cleaner.resetRevealMode();
      }

      for (const mutation of list) {
        if (
          urlChanged ||
          mutation.type === "characterData" ||
          mutation.type === "attributes" ||
          mutation.type === "childList"
        ) {
          throttled();
          break;
        }
      }
    });

    observer.observe(target, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "tpl"],
    });

    return throttled;
  };
})();
