/**
 * Created by Administrator on 2018/5/16 0016.
 */

var cache = {}
module.exports = {
	get(name) {
		return cache[name]
	},
	has(name) {
		return !!cache[name]
	},
	set(name, value) {
		cache[name] = value
	},
	clear(name) {
		if (name) {
			if(cache[name]) {
				delete cache[name]
			}
		} else {
			cache = {}
		}
	}
}