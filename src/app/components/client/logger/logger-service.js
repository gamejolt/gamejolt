angular.module('App.Client.Logger').service('Client_Logger', function() {
	this.getLogInfo = function(description) {
		var Logger = require('client-voodoo').Logger;
		Logger.hijack();
		return Logger.getClientLog(description);
	};
});
