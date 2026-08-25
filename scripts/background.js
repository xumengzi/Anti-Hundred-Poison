// Service Worker（背景脚本）
// 职责：
// 1) 汇总每个 tab 的屏蔽计数（含明细），供 popup 查询与角标显示
// 2) 转发 content script 的最新计数给 popup（解决 popup 打开过早、数据未就绪问题）

const tabStats = new Map(); // tabId -> { total, dynamic, staticCount }

function setBadge(tabId, count) {
  const text = count > 0 ? String(count) : "";
  try {
    chrome.action.setBadgeText({ tabId, text });
    if (count > 0) {
      chrome.action.setBadgeBackgroundColor({ tabId, color: "#e74c3c" });
    }
  } catch (_) {
    /* 某些情况下 tab 已关闭 */
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const tabId = sender.tab && sender.tab.id;
  if (!msg) return;

  if (msg.type === "AHP_COUNT" && tabId != null) {
    const stat = {
      total: msg.count || 0,
      dynamic: msg.dynamic || 0,
      staticCount: msg.staticCount || 0,
    };
    tabStats.set(tabId, stat);
    setBadge(tabId, stat.total);
    // 广播给所有正在打开的 popup / 页面（sendMessage 不会送回同一 tab 的 content script）
    try {
      chrome.runtime.sendMessage({ type: "AHP_COUNT_UPDATE", tabId, stat }, () => {
        void chrome.runtime.lastError; // 没有接收端时忽略
      });
    } catch (_) {
      /* 忽略 */
    }
    return;
  }

  if (msg.type === "AHP_GET_COUNT") {
    const stat = tabStats.get(msg.tabId) || null;
    sendResponse({ count: stat ? stat.total : null, stat });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
});

function clearTabStat(tabId) {
  tabStats.set(tabId, { total: 0, dynamic: 0, staticCount: 0 });
  setBadge(tabId, 0);
}

// 完整页面导航时清零；新文档会重新注入 content script。
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;
  clearTabStat(details.tabId);
});

// 搜索站点的 SPA 翻页不会重新注入脚本，通知现有页面恢复净化并重新扫描。
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) return;
  clearTabStat(details.tabId);
  chrome.tabs.sendMessage(details.tabId, { type: "AHP_PAGE_CHANGED" }, () => {
    void chrome.runtime.lastError;
  });
});
