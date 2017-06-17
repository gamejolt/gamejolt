angular
	.module('App.Client.SystemReportModal')
	.service('Client_SystemReportModal', function($modal) {
		this.show = function() {
			var modalInstance = $modal.open({
				size: 'sm',
				template: require('!html-loader!./system-report-modal.html'),
				controller: 'Client.SystemReportModalCtrl',
				controllerAs: 'modalCtrl',
			});

			return modalInstance.result;
		};
	});
