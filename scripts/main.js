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

  // 尽早注册消息监听，避免 popup 打开时监听器还没挂上
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg) return;
    if (msg.type === "AHP_UNHIDE_ALL") {
      const n = AHP.cleaner ? AHP.cleaner.unhideAll() : 0;
      sendResponse({ ok: true, n });
      return; // 同步响应
    }
    if (msg.type === "AHP_QUERY_COUNT") {
      const c = AHP.counter ? AHP.counter.get() : { total: 0, dynamic: 0, staticCount: 0 };
      sendResponse(c);
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
      console.warn("[AHP] load rules failed:", e);
      return;
    }

    const enabled = AHP.settings.isSiteEnabled(HOST, settings);

    // 2. 若本站被关闭：移除根 class 让静态 CSS 失效，计数归零，直接返回
    if (!enabled) {
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
      runner({ rules, selectors, blackReg, whiteReg, settings });
    }
  });
})();
