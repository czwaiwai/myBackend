/**
 * Created by Administrator on 2018/5/10 0010.
 */
var xss = require('xss')
var options = {
	whiteList:   {
		p: ['class','style'],
		div:['class'],
		span:['class','style'],
		img:['class', 'src', 'alt' ],
		blockquote:['class'],
		ol:['class'],
		li:['class'],
		ul:['class'],
	},        // 若不指定则使用默认配置，可参考xss.whiteList
	safeAttrValue :function (tag, name, value) {
		console.log(tag, name, value)
		if(name === 'style') {
			return value.replace(/font-family:[^;]+;/,'')
		}
	},
	// onTag: function (tag, html, options) {
	// 	if(tag==='script') {
	// 		return ''
	// 	}
	// },
	onTagAttr:   function (tag, attr, value) {
		// tag：当前标签名（小写）
		// attr：当前属性名（小写）
		// value：当前属性值
		// 返回新的属性值，如果想使用默认的处理方式，不返回任何值即可
		// 比如把属性值中的双引号替换为&amp;quote;：return value.replace(/"/g, '&amp;quote;');
		// 以下为默认的处理代码：
		// console.log('-------------')
		console.log(tag,attr,value,'----------------111-')
		// console.log('-------------')
		// if(attr === 'style') {
		// 	// console.log(attr)
		// 	return '';
		// }
		if(tag === 'img' && attr === 'src' && value.indexOf('bssfood.com')>-1 ){
			return 'src="'+ value+'"'
		}
		if (attr === 'href' || attr === 'src') {
			if (/\/\*|\*\//mg.test(value)) {
				return '#';
			}
			if (/^[\s"'`]*((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a):/ig.test(value)) {
				return '#';
			}
		} else if (attr === 'style') {
			if (/\/\*|\*\//mg.test(value)) {
				return '#';
			}
			if (/((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a):/ig.test(value)) {
				return '';
			}
		}
	},  // 若不指定则使用默认配置，可参考xss.onTagAttr
	onIgnoreTag: function (tag, html) {
		// console.log(tag,html)
		return  ''
		// return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	},  // 若不指定则使用默认配置，可参考xss.onIgnoreTag
	// allowCommentTag:true,
};
var html = xss(`<p><b>共享农场介绍</b><b><span lang="EN-US"><o:p></o:p></span></b></p><p><span lang="EN-US">&nbsp; &nbsp; &nbsp;</span><span segoe="" ui";mso-hansi-font-family:="" "segoe="" ui";mso-bidi-font-family:"segoe="" ui";color:#333333'="">湖北省赤壁市白石山生态农业科技有限公司成立于</span><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">2017</span>年<span lang="EN-US">10</span>月，位于湖北省赤壁市茶庵岭镇罗峰村，范围包含罗峰村二组、三组、五组以及十组，水产面积为<span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">180</span>亩，特种养殖面积为<span lang="EN-US">300</span><span segoe="" ui";mso-hansi-font-family:="" "segoe="" ui";mso-bidi-font-family:"segoe="" ui";color:#333333'="">亩，蔬菜种植面积为</span><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">300</span>亩，基地毗邻赤壁市万亩茶园、羊楼洞古镇、新店明清石板街景区，&nbsp;<span segoe="" ui";mso-hansi-font-family:="" "segoe="" ui";mso-bidi-font-family:"segoe="" ui";color:#333333'="">距离赤壁城区</span><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">20</span>里路。<span lang="EN-US"><o:p></o:p></span></p><p><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">&nbsp; &nbsp; &nbsp;</span>白石山生态农业科技有限公司专注做好有机农产品，为赤壁人民的菜篮子安全保驾护航，用山泉水灌溉水田和养殖水产品，用有机肥料培植农作物，<span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">100%</span>保证农产品有机化生产。<span lang="EN-US"><o:p></o:p></span></p><p><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">&nbsp; &nbsp; &nbsp;</span>公司种植养殖基地位于罗峰村白布泉旅游景点的山村里面：</p><p><span lang="EN-US">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ①&nbsp;&nbsp;</span><span segoe="" ui";mso-hansi-font-family:="" "segoe="" ui";mso-bidi-font-family:"segoe="" ui";color:#333333'="">罗峰村二组周家坡农产品种植基地以及共享农场；</span></p><p><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>②&nbsp;&nbsp;罗峰村五组畜牧养殖基地；<span lang="EN-US"><o:p></o:p></span></p><p><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</span>③&nbsp;&nbsp;罗峰村十组水产养殖基地&nbsp;<span segoe="" ui";mso-hansi-font-family:="" "segoe="" ui";mso-bidi-font-family:"segoe="" ui";color:#333333'="">。</span><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'=""><o:p></o:p></span></p><p><span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">&nbsp; &nbsp; &nbsp;&nbsp;</span>产品：大米、土鸡、野猪、野兔、有机蔬菜、龙虾、泥鳅、水库鱼、竹筒酒、干竹笋等。<span lang="EN-USSegoe" ui","sans-serif";="" color:#333333'="">&nbsp;</span></p><p>白石山农场共计有种植面积<span lang="EN-US">300</span>亩，分为自有农场<span lang="EN-US">200</span>亩和共享农场<span lang="EN-US">100</span>亩两部分，为了满足赤壁人民的生活需求，结合农场地理优势，公司计划将自有基地<span lang="EN-US">150</span>亩创建为共享农场，开启我的基地您做主的自有生活模式，满足城市人民节假日休闲到农村，享受田园牧歌的美好生活。</p><p>方案：</p><p><span lang="EN-US">&nbsp;1.<spantimes new="" roman"'="">&nbsp;</spantimes></span>客户家庭需求：根据客户家庭每天，每月，每年需求蔬菜量的大小，决定客户租赁共享农场的菜地面积大小，租赁费用为：</p><p><span lang="EN-US">1.1<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>客户自行耕作：<span lang="EN-US">1000</span>元<span lang="EN-US">/3</span>分地<span lang="EN-US">/</span>年；</p><p><span lang="EN-US">1.2<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>客户委托农场耕作：<span lang="EN-US">2500</span>元<span lang="EN-US">/3</span>分地<span lang="EN-US">/</span>年；</p><p><span lang="EN-US">1.3<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>客户委托农场耕作并配送：<span lang="EN-US">3000</span>元<span lang="EN-US">/3</span>分地<span lang="EN-US">/</span>年；</p><p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;说明：</p><p><span lang="EN-US">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 1.4</span>一家<span lang="EN-US">6</span>口人<span lang="EN-US">1</span>年蔬菜，<span lang="EN-US">3</span>分地可以满足其需求；</p><p><span lang="EN-US">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 1.5&nbsp;</span>所有机肥料均有农场提供，商品肥料由客户到农场仓库购买或者从外面经销商购买。</p><p><span lang="EN-US"><o:p>&nbsp;</o:p></span></p><p><span lang="EN-US">2.&nbsp;</span>耕作模式：</p><p><span lang="EN-US">&nbsp; &nbsp; 2.1<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>客户提供其家庭一年中需要菜的品种和大概数量；</p><p><span lang="EN-US">&nbsp; &nbsp; 2.2<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>休闲时候，客户家庭可以到农场来劳作，享受田园牧歌的生活，公司提供住房（需要缴纳房租费用）和休闲场所，满足客户生活需求；</p><p><span lang="EN-US">&nbsp; &nbsp; 2.3<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>客户忙碌时，由农场对客户租赁菜地进行管理和劳作，客户无需担心蔬菜耕作情况；</p><p><span lang="EN-US">&nbsp; &nbsp; 2.4<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>客户租赁菜地均实行<span lang="EN-US">24H</span>监控，客户可以随时随地通过网络摄像看到菜地作物生长情况。</p><p><span lang="EN-US">3.&nbsp;</span>配送以及销售</p><p><span lang="EN-US">&nbsp; &nbsp; 3.1<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>客户菜地蔬菜超过家庭需求时，可以进行自行销售或者委托公司进行销售；</p><p><span lang="EN-US">&nbsp; &nbsp; 3.2<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span>客户由于工作很忙，可以委托公司进行物流配送，配送费用需要另行商议。</p><p><span lang="EN-US"><o:p>&nbsp;</o:p></span></p><p align="left"><span microsoft="" yahei","sans-serif";mso-bidi-font-family:="" simsun;color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp;农场活动介绍<span lang="EN-US"><o:p></o:p></span></span></p><p align="left"><span lang="EN-USMicrosoft" yahei","sans-serif";="" mso-bidi-font-family:"microsoft="" yahei";color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; &nbsp;1.<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;&nbsp;</spantimes></span><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'="">骑马放牛；<span lang="EN-US"><o:p></o:p></span></spanmicrosoft></p><p align="left"><span lang="EN-USMicrosoft" yahei","sans-serif";="" mso-bidi-font-family:"microsoft="" yahei";color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; &nbsp;2.<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;&nbsp;</spantimes></span><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'="">狩猎野兔；<span lang="EN-US"><o:p></o:p></span></spanmicrosoft></p><p align="left"><span lang="EN-USMicrosoft" yahei","sans-serif";="" mso-bidi-font-family:"microsoft="" yahei";color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; &nbsp;3.<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;&nbsp;</spantimes></span><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'="">垂钓；<span lang="EN-US"><o:p></o:p></span></spanmicrosoft></p><p align="left"><span lang="EN-USMicrosoft" yahei","sans-serif";="" mso-bidi-font-family:"microsoft="" yahei";color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; &nbsp;4.<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;&nbsp;</spantimes></span><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'="">抓泥鳅；<span lang="EN-US"><o:p></o:p></span></spanmicrosoft></p><p align="left"><span lang="EN-USMicrosoft" yahei","sans-serif";="" mso-bidi-font-family:"microsoft="" yahei";color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; &nbsp;5.<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;&nbsp;</spantimes></span><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'="">野炊烧烤；<span lang="EN-US"><o:p></o:p></span></spanmicrosoft></p><p align="left"><span lang="EN-USMicrosoft" yahei","sans-serif";="" mso-bidi-font-family:"microsoft="" yahei";color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; &nbsp;6.<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;</spantimes></span><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'="">小型漂亮<span lang="EN-US">/</span>沐浴山泉；<span lang="EN-US"><o:p></o:p></span></spanmicrosoft></p><p align="left"><span lang="EN-USMicrosoft" yahei","sans-serif";="" mso-bidi-font-family:"microsoft="" yahei";color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; &nbsp;7.<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;&nbsp;</spantimes></span><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'="">观看斗鸡；<span lang="EN-US"><o:p></o:p></span></spanmicrosoft></p><p align="left"><span lang="EN-USMicrosoft" yahei","sans-serif";="" mso-bidi-font-family:"microsoft="" yahei";color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; &nbsp;8.<spantimes new="" roman"'="">&nbsp;&nbsp;&nbsp;&nbsp;</spantimes></span><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'="">采摘。<span lang="EN-US"><o:p></o:p></span></spanmicrosoft></p><p align="left"><spanmicrosoft yahei","sans-serif";="" mso-bidi-font-family:simsun;color:black;mso-font-kerning:0pt'=""><br></spanmicrosoft></p><p align="left"><span microsoft="" yahei","sans-serif";mso-bidi-font-family:="" simsun;color:black;mso-font-kerning:0pt'="">&nbsp; &nbsp;应用介绍<span lang="EN-US"><o:p></o:p></span></span></p><p align="left">共享农场，<sup><span lang="EN-US">&nbsp;</span></sup>为广大用户提供<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">"</span>足不出户，家中坐享有机蔬菜<span lang="EN-US">"</span>的绿色生活。用户在白石山生态农场官网<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'=""><a href="http://www.bssfood.com/">www.bssfood.com</a></span>中注册会员，支付租地金就可选择一块属于自己私家菜地，通过手机网络摄像，远程参与菜地管理，如选种、育苗、浇灌、养护、采摘等，还可以通过<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">24</span>小时高清监控观察和监督菜园的有机种植过程。<span lang="EN-US" arial","sans-serif";mso-fareast-font-family:="" simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><a name="2"></a><a name="sub22974986_2"></a><a name="应用特点"></a>申请流程<span lang="EN-US"><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:arial;color:#333333;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; 1.<spantimes new="" roman"'="">&nbsp;</spantimes></span>选地购地，在线种植。下载、注册白石山生态农场，用户就可以在线选择土地和购买；<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:arial;color:#333333;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; 2.<spantimes new="" roman"'="">&nbsp;</spantimes></span>百种蔬果，随心挑选。多种优质果蔬种子随心挑选；<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:arial;color:#333333;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; 3.<spantimes new="" roman"'="">&nbsp;</spantimes></span>专线专员<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">·</span>全程指导。用户可以根据喜好在线选择绑定农技师，蔬菜安全问题责任化；<sup><span lang="EN-USArial" ,"sans-serif";mso-fareast-font-family:"="" simsun;color:#3366cc;mso-font-kerning:0pt'="">&nbsp;</span></sup><span lang="EN-US" arial","sans-serif";mso-fareast-font-family:="" simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:arial;color:#333333;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; 4.<spantimes new="" roman"'="">&nbsp;</spantimes></span>高清监控<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">·</span>随时管理。用户通过手机指尖管理菜地，<span lang="EN-US" arial","sans-serif";mso-fareast-font-family:="" simsun;color:#333333;mso-font-kerning:0pt'="">24</span>小时全程高清监控随时看<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">;</span>流通历史可追溯，程序化，透明化，公开化；<span lang="EN-US" arial","sans-serif";mso-fareast-font-family:="" simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:arial;color:#333333;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; 5.<spantimes new="" roman"'="">&nbsp;</spantimes></span>新鲜采摘<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">·</span>专业配送。线下采摘与线上专送相结合，省时省力，送货上门，新鲜直达；<sup><span lang="EN-USArial" ,"sans-serif";mso-fareast-font-family:"="" simsun;color:#3366cc;mso-font-kerning:0pt'="">&nbsp;</span></sup><span lang="EN-US" arial","sans-serif";mso-fareast-font-family:="" simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:arial;color:#333333;mso-font-kerning:0pt'="">&nbsp; &nbsp; &nbsp; 6.<spantimes new="" roman"'="">&nbsp;</spantimes></span>公司通过微信设有<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">“</span>菜友圈<span lang="EN-US">”</span>，用户可以随时随地发布动态，相互点赞评论，交流种植经验和心得，并可以在线和菜友交换等值菜品。<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-US"><o:p>&nbsp;</o:p></span></p><p align="left">&nbsp; &nbsp;农场发展<span lang="EN-US"><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">2017</span>年<span lang="EN-US">10</span>月<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">20</span>日，赤壁市白石山生态农业科技有限公司成立；<sup><span lang="EN-US" arial","sans-serif";mso-fareast-font-family:="" simsun;color:#3366cc;mso-font-kerning:0pt'="">&nbsp;</span></sup><span lang="EN-US" arial","sans-serif";mso-fareast-font-family:="" simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">2017</span>年<span lang="EN-US">12</span>月初，共享农场项目启动；<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">2018</span>年<span lang="EN-US">2</span>月底，白石山基础设施建设初步完成；<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">2018</span>年<span lang="EN-US">5</span>月<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">1</span>日起，白石山生态农场电商平台上线；<span lang="EN-US" arial","sans-serif";mso-fareast-font-family:="" simsun;color:#333333;mso-font-kerning:0pt'=""><o:p></o:p></span></p><p align="left"><span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">2018</span>年<span lang="EN-US">6</span>月<span lang="EN-USArial" ,"sans-serif";"="" mso-fareast-font-family:simsun;color:#333333;mso-font-kerning:0pt'="">1</span>日，白石山电商配送中心开业。<span lang="EN-US"><o:p></o:p></span></p><p><span lang="EN-US"><o:p>&nbsp;</o:p></span>&nbsp;</p><p>&nbsp; &nbsp; &nbsp; 赤壁市第一个共享农场正式上线，打造绿色潮流品牌，畅想美好田园生活！</p><p>&nbsp; &nbsp; &nbsp; 我的农场您做主，想种什么就种什么！</p><p>&nbsp; &nbsp; &nbsp; 您动口，我劳作，您劳作，我指导！</p><p>&nbsp; &nbsp; &nbsp; 打造舌尖上的赤壁健康绿色生活品质，引领潮流生活观念！</p><p><span lang="EN-US"><o:p>&nbsp;</o:p></span></p><p>&nbsp; &nbsp; 参观接送：</p><p>公司电商平台销售中心转车接送到基地参观考察。</p><p>候车地点：赤壁市清泉社区白石山家庭生态农场（万泰华府斜对面）</p><p>接待电话：<span lang="EN-US">0715-5222168</span>，<span lang="EN-US">13135959198</span></p><p>联系人：童先生</p><p><br></p><p>&nbsp; &nbsp; &nbsp;农场位置<span lang="EN-US"><o:p></o:p></span></p><p><img src="http://www.bssfood.com/upload/20180510/ruyfL90x_mPOZqKcpJ3R9zon_$date20180510_$1288x492.png"><br></p><p><span lang="EN-US"><br></span></p><p><span lang="EN-US"><o:p>&nbsp;</o:p></span></p>`, options)
console.log(html)
