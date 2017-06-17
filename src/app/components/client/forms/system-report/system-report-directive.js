angular
	.module('App.Client.Forms')
	.directive('gjClientFormSystemReport', function(
		$q,
		Form,
		Api,
		Client_Logger,
	) {
		var form = new Form({
			template: require('./system-report.html'),
		});

		form.onInit = function(scope) {};

		form.onSubmit = function(scope) {
			var log = Client_Logger.getLogInfo();

			var data = {
				description: scope.formModel.description,
				log_lines: log.logLines.join('\n'),
				os_info: log.osInfo,
			};

			return Api.sendRequest('/web/client/logs/submit', data, {
				allowComplexData: ['os_info'],
			});
		};

		return form;
	});
