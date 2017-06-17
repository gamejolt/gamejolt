angular
	.module('App.Client.SystemReportModal')
	.controller('Client.SystemReportModalCtrl', function(
		$scope,
		$modalInstance,
		Growls,
		gettextCatalog,
	) {
		this.onSubmit = function() {
			Growls.success(
				gettextCatalog.getString('system_report.sent_growl'),
				gettextCatalog.getString('system_report.sent_growl_title'),
			);
			$modalInstance.close();
		};

		this.close = function() {
			$modalInstance.dismiss();
		};
	});
