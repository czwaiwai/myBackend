/**
 * Created by Administrator on 2018/5/10 0010.
 */
module.exports = {
	whiteList:   {
		p: ['class','style'],
		div:['class'],
		span:['class','style'],
		img:['class', 'src', 'alt' ],
		blockquote:['class'],
		ol:['class','style'],
		li:['class','style'],
		ul:['class','style'],
		table:['class','style'],
		thead:['class','style'],
		tbody:['class','style'],
		tr:['class','style'],
		td:['class','style'],
		th:['class','style'],
		br:['class','style']
	},        // 若不指定则使用默认配置，可参考xss.whiteList
	safeAttrValue :function (tag, name, value) {
		if(name === 'style') {
			return value.replace(/font-family:[^;]+;/,'')
		}
	},
	onTagAttr:   function (tag, attr, value) {
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
		if(tag === 'iframe') {
			return html
		}
		return  ''
	},  // 若不指定则使用默认配置，可参考xss.onIgnoreTag
	// stripIgnoreTagBody: '*',
	// allowCommentTag:true,
}