const nodemailer = require('nodemailer');
const config = require('../config')
// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
let transporter = nodemailer.createTransport({
    host: 'smtp.mxhichina.com',
    port: 465,
    secureConnection: true,
    secure: true,// true for 465, false for other ports
    auth: {
        user: config.emailAcct, // generated ethereal user
        pass: config.emailPwd // generated ethereal password
    }
});
exports.send = function (to, content, title) {
	return new Promise((resolve,reject) => {
        let mailOptions = {
            from: `${config.emailName}<${config.emailAcct}>`, // sender address
            to: to, // list of receivers
            subject: title || '留言', // Subject line
            text: content, // plain text body
            html: content // html body
        };
        console.log(mailOptions, 'mailOptions')
        transporter.sendMail(mailOptions, (error, info) => {
            console.log(error, info ,'???????')
            if (error) {
            	console.log(error, '---------?error???---------------');
                return reject(error)
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            console.log(info.messageId)
            resolve(info.messageId)
        });
	})
}
// nodemailer.createTestAccount((err, account) => {
// 	// create reusable transporter object using the default SMTP transport
// 	let transporter = nodemailer.createTransport({
// 		host: 'smtp.ethereal.email',
// 		port: 587,
// 		secure: false, // true for 465, false for other ports
// 		auth: {
// 			user: account.user, // generated ethereal user
// 			pass: account.pass // generated ethereal password
// 		}
// 	});
//
// 	// setup email data with unicode symbols
// 	let mailOptions = {
// 		from: '"Fred Foo 👻" <foo@example.com>', // sender address
// 		to: 'bar@example.com, baz@example.com', // list of receivers
// 		subject: 'Hello ✔', // Subject line
// 		text: 'Hello world?', // plain text body
// 		html: '<b>Hello world?</b>' // html body
// 	};
//
// 	// send mail with defined transport object
// 	transporter.sendMail(mailOptions, (error, info) => {
// 		if (error) {
// 			return console.log(error);
// 		}
// 		console.log('Message sent: %s', info.messageId);
// 		// Preview only available when sending through an Ethereal account
// 		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
//
// 		// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
// 		// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// 	});
// });