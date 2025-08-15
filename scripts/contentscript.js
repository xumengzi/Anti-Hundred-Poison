// 净网行动, 从我做起
// 把百毒相关的全部干掉,
// 宁可错杀一千,绝不放过一个
const domainNameList = [
  "www.baidu.com",
  "www.bing.com",
  "www.so.com",
  "www.sogou.com",
];

let keys = [];
let tplList = [];
if (domainNameList.includes(location.host)) {
  keys = [
    "广告",
    "CSDN",
    "baidu",
    "百度文库",
    "百度知道",
    "百度贴吧",
    "百度手机助手",
    "百度下载",
    "百度卫士",
    "百度百科",
    "百度云",
    "百度视频",
    "百度推广",
    "百度AI",
    "百度App技术",
    "百度移动应用",
    "百度杀毒",
    "百度浏览器",
    "百度输入法",
    "hao123",
    "百度影音",
    "百度软件管理",
    "百度经验",
    "百度壁纸",
    "百度下载助手",
    "百度阅读器",
    "百度电脑专家",
    "百度一键root",
    "百度手柄",
    "百度汉语",
    "百度宝宝知道",
    "百度糯米",
    "百度图片",
    "百度阅读",
    "百度翻译",
    "百度魔拍",
    "百度刷机",
    "百度企业信用",
    "百度游戏",
    "百度外卖",
    "百度团购",
    "百度日历",
    "百度乐播",
    "百度相机",
    "百度贴吧青春版",
    "百度地图",
    "百度理财",
    "百度游戏大全",
    "百度多酷棋牌",
    "百度天眼",
    "百度财富",
    "百度医生",
    "百度网盘",
    "百度德州扑克",
    "百度路淘",
    "百度聚聚",
    "百度滴答",
    "百度钱包",
    "百度体育新闻",
    "百度搜索资源平台",
    "百度搜索风云榜",
    "百度智能云",
    "百度指数",
    "百度学术",
    "百度营销中心",
    "百度爱采购",
    "百度公益",
    "百度识图",
    "百度百聘",
    "百度号码认证平台",
    "百度商桥",
    "有钱花",
    "爱番番",
    "FEX",
    "度小满金融",
    "度小满钱包",
    "www.apollo.auto/",
    "百度短网址",
    "百度营销",
    "百家号",
    "百度健康",
    "百度新闻",
    "百度乐玩",
    "百度统计",
    "百度安全",
    "百度认证",
    "百度开发者中心",
    "百度保障",
    "百度手机输入法官网",
    "百度页游中心",
    "百度App",
  ];
  tplList = ["wenda_generate"];
}

if (location.host === "www.baidu.com") {
  hideDom();
  clearBaidu();
  watchDom();
}
if (location.host === "www.bing.com") {
  hideDom();
  clearBing();
}

if (location.host === "www.so.com") {
  hideDom();
}

if (location.host === "www.sogou.com") {
  hideDom();
}

// 添加隐藏的style
function hideDom() {
  // 这里是清除百度页面相关广告
  const removeList = [
    "content_right",
    "u1",
    "s_top_wrap",
    "s_upfunc_menus",
    "s_wrap",
    "s_tab_inner",
    "head_nums_cont_outer",
    "rs",
    "u",
    "searchTag",
    "foot",
    "ftCon",
    "qrcode",
    "tsn_inner",
    "rs_top_new",
    "bdsug",
    "s_tab",
    "bottom_layer",
    "u_sp",
    "s-top-left",
    "s-hotsearch-wrapper",
    "s_side_wrapper",
    "rs-table_3RiQc",
    "b_context",
    "id_h",
    "b_scopebar",
    "b_phead_chat",
    "scroll_cont",
    "cdxConv",
    "b_vList",
    "card_container",
    "often_so",
    "side",
    "hd-rtools",
    "rs-top",
    "right",
    "placeholder",
    "lm-new",
    "rs_new",
    "s_new_search_guide",
    "main-wrapper",
  ];

  // 显示相关节点
  const showList = ["form"];

  // 需要移除父节点
  const removeParentNode = ["#carousel"];
  let style = document.createElement("style");
  let str = "";
  for (let i in removeList) {
    let z = removeList[i];
    if (z === "s_tab") {
      str += `
        #${z}{visibility:hidden!important;opacity: 0!important}
      `;
    } else {
      str += `
        #${z}{display:none!important;opacity: 0!important}
        .${z}{display:none!important;opacity: 0!important}
      `;
    }
  }

  for (let i in showList) {
    let z = showList[i];
    str += `
        #${z}{display:block!important;opacity: 1!important}
        .${z}{display:block!important;opacity: 1!important}
      `;
  }

  for (let i in removeParentNode) {
    let k = removeParentNode[i];
    const domlist = document.querySelectorAll(k);
    domlist.forEach((item) => {
      item.parentNode.style.display = "none";
    });
  }

  let textNode = document.createTextNode(str);
  style.appendChild(textNode);
  style.setAttribute("is-delete", 1);
  document.head.appendChild(style);
}
// 清除百毒相关
function clearBaidu() {
  // 这里是清除百度百家号相关内容
  let list = document.querySelectorAll(".result-op");
  let list1 = document.querySelectorAll(".c-container");
  if (list || list1) {
    let newArr = [...list, ...list1];
    newArr.forEach((item) => {
      let isChecked = keys.find((ele) => {
        return item.innerText.includes(ele);
      });
      const tpl = item.getAttribute("tpl");
      const isTpl = tplList.includes(tpl);
      if (isChecked) {
        item.remove();
      } else {
        if (isTpl) {
          item.remove();
        } else if (item.className === "c-container") {
          const str = `
            padding: 10px; 
            box-shadow: rgb(204, 204, 204) 1px 1px 10px;
            background: #fff;
            border-radius: 8px; 
            position: relative; 
            overflow: hidden;
          `;
          item.setAttribute("style", str);
        }
      }
    });
  }
}
// 清除Bing网站百毒相关
function clearBing() {
  let list = document.querySelectorAll(".b_algo");
  if (list) {
    let newArr = [...list];
    newArr.forEach((item) => {
      let isChecked = keys.find((ele) => {
        return item.innerText.includes(ele);
      });
      if (isChecked) {
        item.remove();
      } else {
        const str = `
					padding: 10px; 
					box-shadow: rgb(204, 204, 204) 1px 1px 10px;
					background: #fff;
					border-radius: 4px; 
					position: relative; 
					overflow: hidden;
				`;
        item.setAttribute("style", str);
      }
    });
  }
}
// 监听dom
function watchDom() {
  //监听dom变化, 然后干掉百毒
  let targetNode = document.getElementById("wrapper_wrapper");
  if (targetNode) {
    let config = { attributes: false, childList: true, subtree: false };
    let callback = function (mutationsList) {
      if (
        !(
          document.querySelectorAll("style[is-delete='1']") &&
          document.querySelectorAll("style[is-delete='1']").length
        )
      ) {
        hideDom();
      }
      mutationsList.forEach(function (item) {
        if (item.type == "childList") {
          clearBaidu();
        }
      });
    };
    let observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }
}
