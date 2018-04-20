/**
 * Created by waiwai on 17-12-1.
 */
module.exports.loginValid = function (req, res, next) {
	if (req.session.user) {
		next()
	} else{
		return res.redirect('/login')
	}
}