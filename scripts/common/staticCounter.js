// 静态隐藏计数：统计 hide.css 实际生效的元素数量
// 逻辑：读取 selectors.json 里的 hide.displayNone / visibilityHidden 列表
//      在页面上按 id / class 查找存在的元素，累加计数
// 说明：hide.css 是提前注入的，这里只是"数一下有多少个被这条规则隐藏"

(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});

  function countStatic(selectors) {
    if (!selectors || !selectors.hide) return 0;
    const displayNone = selectors.hide.displayNone || [];
    const visibilityHidden = selectors.hide.visibilityHidden || [];
    const removeParent = selectors.hide.removeParent || [];

    // 用 Set 去重（同一个元素同时有 id 和同名 class 的极端情况）
    const seen = new Set();
    let n = 0;

    const collect = (list) => {
      for (const key of list) {
        // 原规则同时匹配 #key 和 .key
        document.querySelectorAll(`#${cssEscape(key)}, .${cssEscape(key)}`)
          .forEach((el) => {
            if (seen.has(el)) return;
            seen.add(el);
            n++;
          });
      }
    };

    collect(displayNone);
    collect(visibilityHidden);

    // removeParent 里存的是完整选择器（如 "#carousel"）
    for (const sel of removeParent) {
      document.querySelectorAll(sel).forEach((el) => {
        const p = el.parentNode;
        if (p && !seen.has(p)) {
          seen.add(p);
          n++;
        }
      });
    }

    return n;
  }

  // 简易 CSS 选择器转义，避免 key 含特殊字符时报错
  function cssEscape(s) {
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/([^\w-])/g, "\\$1");
  }

  AHP.staticCounter = { countStatic };
})();
