var fs = require('fs')
var path = require('path')
// var file = fs.readFileSync(path.resolve('./cache'))
// console.log(file.toString())

fs.writeFile(path.resolve('./cache'), 'sdjkfdslkjkfdsklfs',function(err) {
	if(err) {
		return console.log(err)
	}
	fs.readFile(path.resolve('./cache'),function(err, res) {
		if (err) {
			return console.log(err)
		}
		console.log(res.toString(), '------------? -----------')
	})
})