module.exports = {
    "autoTag": true,
    "excludeHostRegexp": false,
    "pathFilterRegexp": false,
    "excludePathFilterRegexp": ".*[.]tpl[.]html$",
    "clearCookies": true,
    "customCookies": false,
    "replaceDateInURL": true,
    "repeat": 0,
    "customHeaders": [{
		"name": "User-Agent",
        "value": "yandex-tank"
    }, {
		"name": "Connection",
        "value": "close"
	}],
	"replaceData": {
		headers: [{
			match: new RegExp(/^(?!Host:).*/), 
			data: function (str, libs) { return '' }
		}]
    }
};