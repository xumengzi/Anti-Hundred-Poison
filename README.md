# Anti-Hundred-Poison
这是一款可以让你的百度清净的【谷歌插件】，可以有效的屏蔽百度全家桶相关的搜索结果，以及一些杂乱无章的东西。

*如果你知道油猴，那么你可以[戳这里](https://greasyfork.org/zh-CN/scripts/455226-anti-hundred-poison-%E5%B1%8F%E8%94%BD%E7%99%BE%E5%BA%A6%E7%9B%B8%E5%85%B3%E7%9A%84%E8%84%9A%E6%9C%AC)安装屏蔽广告的js*

#### 安装插件会屏蔽包括但不限于: 
1. 百度首页无关于搜索的按钮，广告之类
2. 百度全家桶(类似百度知道，百度文库，百度百科，百度系列)
3. 百度搜索界面一些设置按钮
4. 另外着重屏蔽了CSDN，如有冒犯，请勿使用

>仅推荐专业人士使用，不承担任何后果

#### 看看最终效果，清爽简洁，干净了许多
![百度首页](./imgs/1.png)
![js教程](./imgs/4.png)

#### 安装方法
  1. 下载(克隆), 把文件夹保存起来(这个就是解压后的谷歌插件) 
  2. 打开谷歌浏览器,进入插件设置界面`chrome://extensions/`
  3. 打开「开发者模式」-「加载已解压的扩展程序」，右下角有一个刷新按钮，那是为了更新的，如果是更新那么点击刷新
  4. ![安装方法](./imgs/2.png)
  5. 愉快的搜索吧

#### 如何更新
1. 如果原先是克隆的，那么执行`git pull`，记得去浏览器插件管理去刷新一下，加载最新的资源，看不懂这个就执行步骤2
2. 其他：再下载一次也行，执行一遍**安装方法**即可
#### 屏蔽原理
1. 如果搜索条件有关于百度全家桶的字眼，那么这一行会被抹去;
2. 如果是右侧广告，则会隐藏
3. 宁可错杀一千，绝不放过一个

#### 欢迎诸位同仁志士提供意见

#### Q&A
Q: 会对百度搜索结果产生影响吗?

A: 不会，没那个能耐，仅仅是用`js`和`css`进行页面层面上的删除和隐藏

Q: 加载未知谷歌插件会被挖矿吗?

A: 我也想 0.0

Q: 安装未知插件，谷歌提示了咋办?

A: 当然是选择点叉叉忽略呗，还能咋样，原谅!

![安装方法](./imgs/3.png)

Q：为何只屏蔽百度相关的插件？？？？？？？？？？？？？?
A：讨厌这些

#### 不定期更新&维护
#### 2023-07-25 更新
1. 增加「百度健康」屏蔽关键字
#### 2023-04-13 更新
1. 增加「百家号」屏蔽关键字
2. 屏蔽百度搜索栏输入框下边的searchTag

#### 2023-01-17 更新
1. 增加「百度短网址」，「百度营销」屏蔽关键字
#### 2022-07-14 更新
1. 隐藏相关搜索（主体内容都搜不到，还指望相关搜索）
2. 大幅度提交脚本性能，再也不会像之前那么卡顿，欢迎升级
3. 谷歌插件升级到了版本`3`，如果你不知道这是啥，那么也不需要注意
#### 2021-09-09 更新

1. 增加「度小满钱包」等更多屏蔽关键字
#### 2021-07-30 更新

1. 增加「度小满」等更多屏蔽关键字

#### 2021-04-03 更新

1. 屏蔽百度投放广告
#### 2020-11-02 更新

1. 修复卡顿问题

#### 2020-07-22 更新

1. 增加「百度百聘」，「百度号码认证平台」，「百度商桥」，「有钱花」等十余种关键字，屏蔽的内容更加丰富
2. 内容风格优化

#### 2020-07-16 更新

>chrome 83版本不会提示插件不在市场里了，还可以固定插件了

![固定](./imgs/fixed.png)

### 附录
##### 搜索结果含有以下关键字那么会屏蔽
广告，CSDN，baidu，百度文库，百度知道，百度贴吧，百度手机助手，百度下载，百度卫士，百度百科，百度云，百度视频，百度推广，百度AI，百度App技术，百度移动应用，百度杀毒，百度浏览器，百度输入法，hao123，百度影音，百度软件管理，百度经验，百度壁纸，百度下载助手，百度阅读器，百度电脑专家，百度一键root，百度手柄，百度汉语，百度宝宝知道，百度糯米，百度图片，百度阅读，百度翻译，百度魔拍，百度刷机，百度企业信用，百度游戏，百度外卖，百度团购，百度日历，百度乐播，百度相机，百度贴吧青春版，百度地图，百度理财，百度游戏大全，百度多酷棋牌，百度天眼，百度财富，百度医生，百度网盘，百度德州扑克，百度路淘，百度聚聚，百度滴答，百度钱包，百度体育新闻，百度搜索资源平台，百度搜索风云榜，百度智能云，百度指数，百度学术，百度营销中心，百度爱采购，百度公益，百度识图，百度百聘，百度号码认证平台，百度商桥，有钱花，爱番番，FEX，度小满金融，度小满钱包，www.\apollo.\auto，百度短网址，百度营销，百家号，百度健康