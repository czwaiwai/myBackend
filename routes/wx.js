/**
 * Created by Administrator on 2018/4/25 0025.
 */
const express = require('express');
const Wechat = require('../utils/wechat')
const wxConfig = require('../wx.json')
const router = express.Router();
const wechat = new Wechat(wxConfig)
router.get('/', (req, res, next) =>{

	wechat.auth(req, res)
})
router.post('/', (req, res, next) => {
	wechat.handleMsg(req, res)
})
router.get('/getAccessToken', (req, res, next) => {
	wechat.getAccessToken().then(function(data) {
		res.send(data)
	}).catch(err => {
		res.send(err)
	})
})
router.get('/setMenu', (req, res, next) => {
	wechat.setMenu({})
})
module.exports = router
