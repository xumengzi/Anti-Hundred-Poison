// Ad Terminator Popup：站点状态、拦截统计与本站开关

const SITES = {
  "www.baidu.com": "百度搜索",
  "www.bing.com": "Bing 搜索",
  "www.so.com": "360 搜索",
  "www.sogou.com": "搜狗搜索",
};

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

const state = {
  tabId: null,
  host: "",
  supported: false,
  enabled: false,
  contentReady: false,
  runtimeStatus: "unavailable",
  revealing: false,
  stat: null,
};

const $ = (id) => document.getElementById(id);
let tipTimer = null;

function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      void chrome.runtime.lastError;
      resolve(tabs && tabs[0]);
    });
  });
}

function getSettings() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (result) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(result || DEFAULT_SETTINGS);
    });
  });
}

function setSettings(patch) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(patch, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve();
    });
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
  clearTimeout(tipTimer);
  el.classList.toggle("tip--error", !ok);
  el.textContent = text;
  tipTimer = setTimeout(() => {
    el.textContent = "";
    el.classList.remove("tip--error");
  }, 3000);
}

function queryCountFromTab(tabId, timeout = 500) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => finish(null), timeout);
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    try {
      chrome.tabs.sendMessage(tabId, { type: "AHP_QUERY_COUNT" }, (res) => {
        const error = chrome.runtime.lastError;
        if (error || !res || typeof res.total !== "number") {
          finish(null);
          return;
        }
        finish(res);
      });
    } catch {
      finish(null);
    }
  });
}

function queryStatFromBackground(tabId) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "AHP_GET_COUNT", tabId }, (res) => {
      void chrome.runtime.lastError;
      resolve((res && res.stat) || null);
    });
  });
}

function revealResultsInTab(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { type: "AHP_UNHIDE_ALL" }, (res) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      if (!res || !res.ok) {
        reject(new Error("页面未响应"));
        return;
      }
      resolve(res);
    });
  });
}

function setStatus(text, modifier) {
  const el = $("status");
  el.textContent = text;
  el.className = `status status--${modifier}`;
}

function render() {
  const siteEnabled = $("siteEnabled");
  const revealButton = $("revealResults");

  if (!state.supported) {
    $("siteName").textContent = "当前网站暂不支持";
    $("siteHost").textContent = state.host || "浏览器内部页面";
    setStatus("不支持", "unsupported");
  } else {
    $("siteName").textContent = SITES[state.host];
    $("siteHost").textContent = state.host;
    if (!state.enabled || state.runtimeStatus === "disabled") {
      setStatus("已暂停", "paused");
    } else if (state.runtimeStatus === "ready") {
      setStatus("保护中", "active");
    } else if (state.runtimeStatus === "error") {
      setStatus("加载失败", "unsupported");
    } else if (state.runtimeStatus === "initializing") {
      setStatus("初始化中", "waiting");
    } else {
      setStatus("等待页面", "waiting");
    }
  }

  siteEnabled.checked = state.supported && state.enabled;
  siteEnabled.disabled = !state.supported;
  $("switchText").textContent = state.enabled ? "本站净化" : "本站已暂停";

  if (!state.supported) {
    $("count").textContent = "—";
    $("countDetail").textContent = "仅支持百度、Bing、360 和搜狗搜索";
  } else if (!state.stat) {
    $("count").textContent = "—";
    $("countDetail").textContent = state.contentReady
      ? "正在统计"
      : "页面尚未就绪，请刷新后重试";
  } else {
    $("count").textContent = String(state.stat.total || 0);
    $("countDetail").textContent = `页面元素 ${state.stat.staticCount || 0} · 搜索结果 ${state.stat.dynamic || 0}`;
  }

  const dynamicCount = state.stat ? state.stat.dynamic || 0 : 0;
  revealButton.disabled =
    !state.supported ||
    !state.enabled ||
    !state.contentReady ||
    state.revealing ||
    dynamicCount === 0;
  revealButton.textContent = state.revealing
    ? "已临时显示搜索结果"
    : "临时显示已拦截的搜索结果";
}

async function handleSiteToggle(event) {
  const input = event.currentTarget;
  const requested = input.checked;
  const previous = state.enabled;
  input.disabled = true;
  $("switchText").textContent = "正在保存";

  try {
    const latest = await getSettings();
    const perSite = {
      ...DEFAULT_SETTINGS.perSite,
      ...(latest.perSite || {}),
      [state.host]: { enabled: requested },
    };
    await setSettings({ perSite });
    state.enabled = requested;
    render();
    showTip(requested ? "已开启，相关页面正在同步" : "已暂停，相关页面正在同步");
  } catch (error) {
    state.enabled = previous;
    render();
    showTip("设置保存失败，请重试", false);
  }
}

async function handleRevealResults() {
  const button = $("revealResults");
  button.disabled = true;
  button.textContent = "正在显示…";

  try {
    const result = await revealResultsInTab(state.tabId);
    state.revealing = true;
    if (result.stat) state.stat = result.stat;
    render();
    showTip(
      result.n > 0
        ? `已临时显示 ${result.n} 条搜索结果`
        : "当前没有可显示的搜索结果"
    );
  } catch (error) {
    render();
    showTip("无法连接当前页面，请刷新后重试", false);
  }
}

async function init() {
  const tab = await getCurrentTab();
  state.tabId = tab && tab.id != null ? tab.id : null;
  state.host = hostOfTab(tab);
  state.supported = Object.prototype.hasOwnProperty.call(SITES, state.host);

  let settings = DEFAULT_SETTINGS;
  try {
    settings = await getSettings();
  } catch {
    showTip("读取设置失败，请重试", false);
  }

  const site = settings.perSite && settings.perSite[state.host];
  state.enabled = state.supported && (!site || site.enabled !== false);

  if (state.supported && state.tabId != null) {
    const liveStat = await queryCountFromTab(state.tabId);
    state.runtimeStatus = liveStat ? liveStat.status || "initializing" : "unavailable";
    state.contentReady = state.runtimeStatus === "ready";
    state.revealing = Boolean(liveStat && liveStat.revealing);
    state.stat = liveStat || (await queryStatFromBackground(state.tabId));
  }

  render();
  $("siteEnabled").addEventListener("change", handleSiteToggle);
  $("revealResults").addEventListener("click", handleRevealResults);

  chrome.runtime.onMessage.addListener((msg) => {
    if (
      msg &&
      msg.type === "AHP_COUNT_UPDATE" &&
      msg.tabId === state.tabId &&
      msg.stat
    ) {
      state.stat = msg.stat;
      if (state.runtimeStatus === "initializing") {
        queryCountFromTab(state.tabId).then((liveStat) => {
          if (!liveStat) return;
          state.runtimeStatus = liveStat.status || state.runtimeStatus;
          state.contentReady = state.runtimeStatus === "ready";
          state.revealing = Boolean(liveStat.revealing);
          state.stat = liveStat;
          render();
        });
      }
      render();
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes.perSite || !state.supported) return;
    const next = changes.perSite.newValue || {};
    const siteConfig = next[state.host];
    state.enabled = !siteConfig || siteConfig.enabled !== false;
    render();
  });
}

init().catch(() => {
  setStatus("读取失败", "unsupported");
  showTip("Popup 初始化失败，请重新打开", false);
});
