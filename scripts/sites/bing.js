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

    // Bing 也做一轮弱监听，防止无限滚动追加结果
    const throttled = AHP.utils.rafThrottle(clean);
    const observer = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "childList" && m.addedNodes.length) {
          throttled();
          break;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };
})();
