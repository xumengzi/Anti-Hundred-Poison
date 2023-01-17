// 净网行动, 从我做起
// 把百毒相关的全部干掉,
// 宁可错杀一千,绝不放过一个
if (location.host === "www.baidu.com") {
	hideDom();
	clearBaidu();
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
		"foot",
		"ftCon",
		"qrcode",
		"rs_top_new",
		"bdsug",
		"s_tab",
		"bottom_layer",
		"u_sp",
		"s-top-left",
		"s-hotsearch-wrapper",
		"s_side_wrapper",
		"rs-table_3RiQc",
	];
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
	let textNode = document.createTextNode(str);
	style.appendChild(textNode);
	style.setAttribute('is-delete', 1);
	document.head.appendChild(style);
}
// 清除百毒相关
function clearBaidu() {
	// 这里是清除百度百家号相关内容
	let list = document.querySelectorAll(".result-op");
	let list1 = document.querySelectorAll(".c-container");
	if (list || list1) {
		let keys = [
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
			"百度营销"
		];
		let newArr = [...list, ...list1];
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

//监听dom变化, 然后干掉百毒
let targetNode = document.getElementById("wrapper_wrapper");
if (targetNode) {
	let config = { attributes: false, childList: true, subtree: false };
	let callback = function (mutationsList) {
		if (!(document.querySelectorAll("style[is-delete='1']") && document.querySelectorAll("style[is-delete='1']").length)) {
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
