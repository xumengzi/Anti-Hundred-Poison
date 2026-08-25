// 入口：加载规则 → 合并用户配置 → 分发到站点模块
// 同时监听来自 popup 的消息（临时展开、计数查询）

const AHP_TAG = "%c[AHP]";
const AHP_STYLE = "color:#fff;background:#e74c3c;padding:1px 6px;border-radius:3px";

(function () {
  const AHP = window.__AHP__ || {};
  console.log(AHP_TAG, AHP_STYLE, "content script loaded, host=", location.host);
  if (!AHP.utils) {
    console.warn(AHP_TAG, AHP_STYLE, "utils module missing, abort");
    return;
  }

  const HOST = location.host;
  const SITE_MAP = {
    "www.baidu.com": "baidu",
    "www.bing.com": "bing",
    "www.so.com": "so",
    "www.sogou.com": "sogou",
  };
  const siteKey = SITE_MAP[HOST];
  if (!siteKey) return;
  let runtimeStatus = "initializing";
  let refreshPage = null;

  // 同一站点的开关变化时，各标签页自行刷新，避免申请额外 tabs 权限。
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes.perSite) return;
    const oldSites = changes.perSite.oldValue || {};
    const newSites = changes.perSite.newValue || {};
    const wasEnabled = !oldSites[HOST] || oldSites[HOST].enabled !== false;
    const isEnabled = !newSites[HOST] || newSites[HOST].enabled !== false;
    if (wasEnabled !== isEnabled) location.reload();
  });

  // 尽早注册消息监听，避免 popup 打开时监听器还没挂上
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg) return;
    if (msg.type === "AHP_UNHIDE_ALL") {
      const n = AHP.cleaner ? AHP.cleaner.unhideAll() : 0;
      const stat = AHP.counter
        ? AHP.counter.get()
        : { total: 0, dynamic: 0, staticCount: 0 };
      sendResponse({ ok: true, n, stat, revealing: true });
      return; // 同步响应
    }
    if (msg.type === "AHP_PAGE_CHANGED") {
      if (AHP.cleaner) AHP.cleaner.resetRevealMode(true);
      if (typeof refreshPage === "function") {
        refreshPage();
        setTimeout(refreshPage, 100);
      }
      return;
    }
    if (msg.type === "AHP_QUERY_COUNT") {
      if (AHP.cleaner && AHP.counter) {
        AHP.counter.setDynamic(AHP.cleaner.getHiddenCount());
      }
      const c = AHP.counter
        ? AHP.counter.get()
        : { total: 0, dynamic: 0, staticCount: 0 };
      sendResponse({
        ...c,
        status: runtimeStatus,
        revealing: AHP.cleaner ? AHP.cleaner.isRevealMode() : false,
      });
      return;
    }
  });

  AHP.utils.onReady(async () => {
    // 1. 并行加载规则与用户配置
    let rules, selectors, settings;
    try {
      [rules, selectors, settings] = await Promise.all([
        AHP.utils.loadJSON("rules/keywords.json"),
        AHP.utils.loadJSON("rules/selectors.json"),
        AHP.settings.getAll(),
      ]);
    } catch (e) {
      runtimeStatus = "error";
      console.warn("[AHP] load rules failed:", e);
      return;
    }

    const enabled = AHP.settings.isSiteEnabled(HOST, settings);

    // 2. 若本站被关闭：移除根 class 让静态 CSS 失效，计数归零，直接返回
    if (!enabled) {
      runtimeStatus = "disabled";
      AHP.settings.setEnabledOnRoot(false);
      if (AHP.counter) AHP.counter.setStatic(0);
      console.log(AHP_TAG, AHP_STYLE, "site disabled by user");
      return;
    }

    // 3. 启用状态：统计静态 CSS 隐藏的元素数量
    if (AHP.staticCounter && AHP.counter) {
      const n = AHP.staticCounter.countStatic(selectors);
      AHP.counter.setStatic(n);
      console.log(AHP_TAG, AHP_STYLE, "static hidden count =", n);
    } else {
      console.warn(AHP_TAG, AHP_STYLE, "staticCounter or counter missing");
    }

    // 4. 合并黑白名单
    const allKeys = (rules.keys || []).concat(settings.customKeywords || []);
    const blackReg = AHP.utils.buildKeywordRegExp(allKeys);
    const whiteReg = AHP.utils.buildKeywordRegExp(settings.whitelist || []);

    // 5. 分发到站点模块
    const runner = AHP.sites && AHP.sites[siteKey];
    if (typeof runner === "function") {
      try {
        const refresh = runner({ rules, selectors, blackReg, whiteReg, settings });
        refreshPage = typeof refresh === "function" ? refresh : null;
        runtimeStatus = "ready";
      } catch (error) {
        runtimeStatus = "error";
        console.warn("[AHP] site runner failed:", error);
      }
    } else {
      runtimeStatus = "error";
    }
  });
})();
