/**
 * Created by waiwai on 17-12-1.
 */
module.exports.loginValid = function (req, res, next) {
	req.isAjax = false
	if (req.header('X-Requested-With') === 'XMLHttpRequest') {
		req.isAjax = true
	}
	if (req.session.user) {
		next()
	} else{
		if (req.isAjax) {
			return res.json({
				code:0,
				message: '你还没有登录哦~',
				data: {}
			})
		}
		return res.redirect('/login')
	}
}