// 净网行动, 从我做起
// 把百毒相关的全部干掉, 
// 宁可错杀一千,绝不放过一个
location.host === "www.baidu.com" && clearBaidu();

// 清除百毒相关
function clearBaidu(){
  const removeList = [
    'content_right', 'u1', 's_top_wrap', 's_upfunc_menus', 's_wrap', 's_tab_inner', 'head_nums_cont_outer',
    'rs', 'u', 'foot', 'ftCon', 'qrcode', 'rs_top_new', 'bdsug', 's_tab', 'bottom_layer', 'u_sp'
  ];
  let style = document.createElement('style');
  let str = '';
  for (let i in removeList) {
    let z = removeList[i];
    if (z === 's_tab'){
      str += `
        #${z}{visibility:hidden!important;opacity: 0!important}
      `;
    }else{
      str += `
        #${z}{display:none!important;opacity: 0!important}
        .${z}{display:none!important;opacity: 0!important}
      `;
    }
  }
  let textNode = document.createTextNode(str);
  style.appendChild(textNode);
  document.head.appendChild(style);

  let list = document.querySelectorAll('.result-op')
  let list1 = document.querySelectorAll('.c-container')
  if (list || list1) {
    let keys = [
      'CSDN', 'baidu', '百度文库', '百度知道', '百度贴吧', '百度手机助手', '百度下载', '百度卫士',
      '百度百科', '百度云', '百度视频', '百度推广', '百度AI', '百度App技术', '百度移动应用',
      '百度杀毒', '百度浏览器', '百度输入法', 'hao123', '百度影音', '百度软件管理', '百度经验',
      '百度壁纸', '百度下载助手', '百度阅读器', '百度电脑专家', '百度一键root', '百度手柄',
      '百度宝宝知道', '百度糯米', '百度图片', '百度阅读', '百度翻译', '百度魔拍', '百度刷机', 
      '百度游戏', '百度外卖', '百度团购', '百度日历', '百度乐播', '百度相机', '百度贴吧青春版', 
      '百度理财', '百度游戏大全', '百度多酷棋牌', '百度天眼', '百度财富', '百度医生', 
      '百度德州扑克', '百度路淘', '百度聚聚', '百度滴答', '百度钱包', '百度体育新闻'
    ];
    let newArr = [list, list1];
    for (let i in newArr) {
      newArr[i].forEach(item => {
        for (let i in keys) {
          if (item.innerText.includes(keys[i])) {
            item.remove();
          }
        }
      })
    }
  };
}

//监听dom变化, 然后干掉百毒
let targetNode = document.getElementById('wrapper_wrapper');
if (targetNode){
  let config = { attributes: true, childList: true, subtree: true };
  let callback = function (mutationsList) {
    mutationsList.forEach(function (item, index) {
      if (item.type == 'childList') {
        clearBaidu();
      } else if (item.type == 'attributes') {
        clearBaidu();
      }
    });
  };
  let observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}
