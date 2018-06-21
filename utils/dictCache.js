/**
 * Created by Administrator on 2018/5/16 0016.
 */

let {Dict} = require('../viewModels')
var fs = require('fs')
function dictCache () {
	let cache = {}
	let time = 0
	return {
		getFile(cb) {
			fs.readFile('./cache', (err, res) => {
				if(err) {
					return cb (false)
				}
				console.log(time,  res.toString(), '对比')
				if(time + '' === res.toString()) {
					cb(true)
				} else {
					cb(false)
				}
			})
		},
		setFile(cb) {
			let timeNum = (new Date()).valueOf()
			fs.writeFile('./cache', timeNum, (err) => {
				if(err) {
					return cb(false, timeNum)
				}
				cb(true, timeNum)
			})
		},
		getDicts (name, cb) {
			this.getFile((bool) => {
				console.log(bool, '为true走getCache')
				if(bool) {
					this.getCache(name,cb)
				}else {
					this.resetAll((timeNum => {
						this.setCache(name, cb)
					}))
				}
			})
		},
		getCache(name, cb) {
			if(cache[name]) {
				console.log('存在直接返回')
				cb(null, cache[name])
			} else{
				console.log('不存在区数据库查询')
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
		resetAll (cb) {
			this.setFile((bool, timeNum) => {
				time = timeNum
				cache = {}
				cb && cb(timeNum)
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