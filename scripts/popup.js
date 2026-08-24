// Popup 逻辑：显示屏蔽计数 + 本站启用开关
// 注：storage 里保留 customKeywords / whitelist 字段（下期迭代使用）

const SUPPORTED_HOSTS = [
  "www.baidu.com",
  "www.bing.com",
  "www.so.com",
  "www.sogou.com",
];

const DEFAULT_SETTINGS = {
  perSite: {
    "www.baidu.com": { enabled: true },
    "www.bing.com": { enabled: true },
    "www.so.com": { enabled: true },
    "www.sogou.com": { enabled: true },
  },
  customKeywords: [],
  whitelist: [],
};

const $ = (id) => document.getElementById(id);

function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs && tabs[0]);
    });
  });
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, resolve);
  });
}

function setSettings(patch) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(patch, resolve);
  });
}

function hostOfTab(tab) {
  try {
    return new URL(tab.url).host;
  } catch {
    return "";
  }
}

function showTip(text, ok = true) {
  const el = $("tip");
  el.style.color = ok ? "#27ae60" : "#e74c3c";
  el.textContent = text;
  setTimeout(() => (el.textContent = ""), 1500);
}

// 向 content script 请求计数，带超时；超时或未响应则回退到 background
function queryCountFromTab(tabId, timeout = 300) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    try {
      chrome.tabs.sendMessage(tabId, { type: "AHP_QUERY_COUNT" }, (res) => {
        void chrome.runtime.lastError;
        if (res && typeof res.total === "number") finish(res);
        else finish(null);
      });
    } catch {
      finish(null);
    }
    setTimeout(() => finish(null), timeout);
  });
}

function queryStatFromBg(tabId) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "AHP_GET_COUNT", tabId },
      (res) => {
        void chrome.runtime.lastError;
        resolve((res && res.stat) || null);
      }
    );
  });
}

function renderCount(stat) {
  const s = stat || { total: 0, dynamic: 0, staticCount: 0 };
  $("count").textContent = s.total || 0;
  $("countDetail").textContent = `（页面元素 ${s.staticCount || 0} + 搜索结果 ${s.dynamic || 0}）`;
}

async function init() {
  const tab = await getCurrentTab();
  const host = hostOfTab(tab);
  const supported = SUPPORTED_HOSTS.includes(host);
  const settings = await getSettings();
  const tabId = tab && tab.id;

  // 1. 计数：优先从 content script 拿最新的，拿不到则回退 background 缓存
  let stat = null;
  if (supported && tabId != null) {
    stat = await queryCountFromTab(tabId);
    if (!stat) stat = await queryStatFromBg(tabId);
  }
  renderCount(stat);

  // 1.1 订阅后续更新：content script 完成清理后会通过 background 广播新计数
  //     解决 popup 打开过早、此时 content 尚未完成统计导致显示 0 的问题
  if (supported && tabId != null) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (
        msg &&
        msg.type === "AHP_COUNT_UPDATE" &&
        msg.tabId === tabId &&
        msg.stat
      ) {
        renderCount(msg.stat);
      }
    });
  }

  // 2. 本站开关：勾选即时保存并刷新
  const siteEnabled = $("siteEnabled");
  if (supported) {
    const site = settings.perSite[host] || { enabled: true };
    siteEnabled.checked = site.enabled !== false;
    siteEnabled.disabled = false;
    siteEnabled.addEventListener("change", async () => {
      const next = {
        perSite: {
          ...settings.perSite,
          [host]: { enabled: siteEnabled.checked },
        },
      };
      await setSettings(next);
      showTip(siteEnabled.checked ? "已开启，正在刷新" : "已关闭，正在刷新");
      if (tabId != null) chrome.tabs.reload(tabId);
    });
  } else {
    siteEnabled.checked = false;
    siteEnabled.disabled = true;
  }
}

init();
