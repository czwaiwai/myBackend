/**
 * Created by Administrator on 2018/5/14 0014.
 */
var crypto = require('crypto');
var {UrlEncode,UrlDecode} = require('../utils/urlEncodeFn')
var kdn = require('../utils/kdniao')
kdn('493760162610').then(res => {
	console.log(res, '最后的结果----------------------')
})

//{ xml:
	// { return_code: 'SUCCESS',
	// 	appid: 'wx2b6b34e4a0735bc0',
	// 	mch_id: '1500403302',
	// 	nonce_str: '110623459b8651e6cfee2c7c3e76fc1b',
	// 	req_info: '4rEolCB8JJ7qJbV+kmjKYLS4MDyuZzjBUA/0RQAmwlwT+V0cUlrlKHtV4JIMgNAxw+qCQOYMkvyohvVbrDuURRqfoWQD6PSWFEgFjA4Z98dr3VA37kR+BZEhNRDSz/9KUgtBitZBnPjzw2szyuA5EKIerZDzrEJDT0rl+c/MsXXrzAWI0VmNRxeEZcTJPtIiphrRvSJzjvQPl9dLNKLaHr3Ld1xAC8/2bJf/FEaVFL8blyDVZ6oN8q3W6thPb2y/uKUO54QyeZU/avdLNNu14/xqgwVMMOaVGBtjd+GdAe8OzcD4AMU1Z9FnCmkypkPpoVOApDORsLQv3i4dC5UqOrEDG9/bsOxSdJkffG7Q58+uPdogDREa6k6M9RPiOZ6IQV+DPAq7Sje6JKZmr+LQPHsChCkLjvoS6g2nFfUHzYfNdBvH5Cwp99Y4uIwUL6bgWmQT/lCwlyFtfU5+Clo7qTugBw7EzzUioAXQM05Ux7plQmUK+gdrvlrg6jXFL5NjrCjFuH8O373ceqb4edTedT8/k/YsobRNUtwtLUUsIrnZ7Man0ia4ZOL/rzaUTa3aInsXO4Ivzn7lfX4ebTJ3741VAwLQm9OwJv7pFaxHRH4ieiHAp/cKEw5rZur5AV3gdbOa+rikOCqSq+1Kz+NRkqWBj0sFBi54NLJ55cIX1n/HUXg3AgcXNbgg7HMQ96xY3QrXUHn2VghZXKLVHQYnYxgIKaGsOMH5DwJ8nWPJkgZ9hZ/QNPnS4N3vWMVG96rJ0YsdXMgvelPvUA15aHq1e8yHAiOBraXI3Mzd2VMOgeOxQxrAJqwN2TROhYD11uSEzZUxvEe6+0nhdPMXlO3K+mVTOzGWV+wRwcqkDmtd/3QGvrp3UnrlxDauNy9TDALRiEhKuOCo7qH246L1tO8GTUtmY96V2943XqzG/EK21ExcM8JYzDR0isOmS2b9ws+YILPCyj0XvdZHteq44H9vSmFLXbOn7mc9kT7gVwVtR3a0FvADhf4nqo3QoIvdmzxn/YjHnryAhQAplkzCHHvNFA==' } }


var req_info = '4rEolCB8JJ7qJbV+kmjKYLS4MDyuZzjBUA/0RQAmwlwT+V0cUlrlKHtV4JIMgNAxw+qCQOYMkvyohvVbrDuURRqfoWQD6PSWFEgFjA4Z98dr3VA37kR+BZEhNRDSz/9KUgtBitZBnPjzw2szyuA5EKIerZDzrEJDT0rl+c/MsXXrzAWI0VmNRxeEZcTJPtIiphrRvSJzjvQPl9dLNKLaHr3Ld1xAC8/2bJf/FEaVFL8blyDVZ6oN8q3W6thPb2y/uKUO54QyeZU/avdLNNu14/xqgwVMMOaVGBtjd+GdAe8OzcD4AMU1Z9FnCmkypkPpoVOApDORsLQv3i4dC5UqOrEDG9/bsOxSdJkffG7Q58+uPdogDREa6k6M9RPiOZ6IQV+DPAq7Sje6JKZmr+LQPHsChCkLjvoS6g2nFfUHzYfNdBvH5Cwp99Y4uIwUL6bgWmQT/lCwlyFtfU5+Clo7qTugBw7EzzUioAXQM05Ux7plQmUK+gdrvlrg6jXFL5NjrCjFuH8O373ceqb4edTedT8/k/YsobRNUtwtLUUsIrnZ7Man0ia4ZOL/rzaUTa3aInsXO4Ivzn7lfX4ebTJ3741VAwLQm9OwJv7pFaxHRH4ieiHAp/cKEw5rZur5AV3gdbOa+rikOCqSq+1Kz+NRkqWBj0sFBi54NLJ55cIX1n/HUXg3AgcXNbgg7HMQ96xY3QrXUHn2VghZXKLVHQYnYxgIKaGsOMH5DwJ8nWPJkgZ9hZ/QNPnS4N3vWMVG96rJ0YsdXMgvelPvUA15aHq1e8yHAiOBraXI3Mzd2VMOgeOxQxrAJqwN2TROhYD11uSEzZUxvEe6+0nhdPMXlO3K+mVTOzGWV+wRwcqkDmtd/3QGvrp3UnrlxDauNy9TDALRiEhKuOCo7qH246L1tO8GTUtmY96V2943XqzG/EK21ExcM8JYzDR0isOmS2b9ws+YILPCyj0XvdZHteq44H9vSmFLXbOn7mc9kT7gVwVtR3a0FvADhf4nqo3QoIvdmzxn/YjHnryAhQAplkzCHHvNFA=='
var key = 'BGR8etsLQMCkH7bi9LhJjS3Xl4zCh1E8'

function md5 (str) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	str = md5sum.digest('hex');
	return str
}


console.log(UrlEncode(`{"LogisticCode":"493760162610"}`))
// console.log(refundDecode(req_info,key))

// var str =`{'OrderCode':'','ShipperCode':'SF','LogisticCode':'118954907573'}56da2cf8-c8a2-44b2-b6fa-476cd7d1ba17`
// var md5Str = md5(str)
// var res = (new Buffer(md5Str)).toString('base64')
// OWFhM2I5N2ViM2U2MGRkMjc4YzU2NmVlZWI3ZDk0MmE=
// OWFhM2I5N2ViM2U2MGRkMjc4YzU2NmVlZWI3ZDk0MmE=

