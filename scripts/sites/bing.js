// Bing 站点适配
(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});

  AHP.sites = AHP.sites || {};
  AHP.sites.bing = function run(ctx) {
    const { selectors, blackReg, whiteReg } = ctx;

    const clean = AHP.cleaner.buildCleaner({
      selector: selectors.resultSelectors.bing,
      blackReg,
      whiteReg,
      tplList: null,
      cardStyle: selectors.cardStyle.bing,
      isCardTarget: () => true,
    });

    clean();

    // 监听稳定的文档根节点，兼容结果容器替换、无限滚动和同文档翻页。
    const throttled = AHP.utils.rafThrottle(clean);
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
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "tpl"],
    });

    return throttled;
  };
})();
