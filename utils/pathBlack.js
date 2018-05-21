
let list = [
	'/pma',
	'/dbadmin',
	'/db',
	'/phpmyadmin',
	'/dbadmin',
	'/phpadmin',
	'/rpc2',
	'.php'
]
module.exports = function(req, res ,next) {
	let pass = true
	list.forEach(item => {
		pass = pass && req.url.toLocaleLowerCase().indexOf(item) === -1
	})
	if (/\.php.*\?/.test(req.url)) {
		pass = false
	}
	if(pass){
		return next()
	} else {
		console.log(new Date, '攻击拦截-----------', req.url)
		return res.status(403).end()
	}
}