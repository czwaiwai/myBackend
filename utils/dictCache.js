/**
 * Created by Administrator on 2018/5/16 0016.
 */

let {Dict} = require('../viewModels')
function dictCache () {
	let cache = {}
	return {
		getDicts (name, cb) {
			if(cache[name]) {
				cb(null, cache[name])
			} else{
				this.setCache(name, cb)
			}
		},
		setCache (name, cb) {
			Dict.findByGroup(name, (err, dictArr) => {
				if(err) return cb(err)
				cache[name] = dictArr
				return cb(err, cache[name])
			})
		},
		resetCache (name) {
			cache[name] = null
			return true
		}
	}
}
let instance = null
dictCache.getInstance = function () {
	if(!instance){
		instance = dictCache()
	}
	return instance
}
module.exports = dictCache