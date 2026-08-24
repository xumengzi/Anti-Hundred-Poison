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

    const target =
      document.getElementById("content_left") ||
      document.getElementById("wrapper_wrapper") ||
      document.body;

    if (!target) return;

    const observer = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "childList" && m.addedNodes.length) {
          throttled();
          break;
        }
      }
    });

    observer.observe(target, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  };
})();
