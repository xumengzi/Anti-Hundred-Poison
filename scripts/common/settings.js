// 用户配置管理：读取 chrome.storage.sync，提供默认值
// 数据结构：
// {
//   perSite: { "www.baidu.com": { enabled: true }, ... },
//   customKeywords: string[],   // 用户自定义关键词
//   whitelist: string[],        // 用户白名单关键词（命中的结果不屏蔽）
// }

(function () {
  const AHP = (window.__AHP__ = window.__AHP__ || {});

  const DEFAULT = {
    perSite: {
      "www.baidu.com": { enabled: true },
      "www.bing.com": { enabled: true },
      "www.so.com": { enabled: true },
      "www.sogou.com": { enabled: true },
    },
    customKeywords: [],
    whitelist: [],
  };

  // 用于让静态 CSS 支持"关闭"开关：hide.css 里所有规则限定 html.ahp-on
  // document_start 阶段同步加类，异步查配置若发现本站关闭则移除
  const ROOT_CLASS = "ahp-on";
  if (document.documentElement) {
    document.documentElement.classList.add(ROOT_CLASS);
  }

  function setEnabledOnRoot(on) {
    const el = document.documentElement;
    if (!el) return;
    el.classList.toggle(ROOT_CLASS, !!on);
  }

  function getAll() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(DEFAULT, (res) => resolve(res));
    });
  }

  function isSiteEnabled(host, cfg) {
    const site = cfg && cfg.perSite && cfg.perSite[host];
    // 显式为 false 才关闭，未配置默认启用
    if (site && site.enabled === false) return false;
    return true;
  }

  AHP.settings = { DEFAULT, getAll, isSiteEnabled, setEnabledOnRoot, ROOT_CLASS };
})();

