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
    const id = msg.tabId;
    const stat = tabStats.get(id) || { total: 0, dynamic: 0, staticCount: 0 };
    sendResponse({ count: stat.total, stat });
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
});

// 页面刷新 / 导航开始时清零
chrome.webNavigation &&
  chrome.webNavigation.onCommitted &&
  chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) return;
    tabStats.set(details.tabId, { total: 0, dynamic: 0, staticCount: 0 });
    setBadge(details.tabId, 0);
  });
