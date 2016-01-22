angular.module( 'App.Client.SystemReportModal' ).controller( 'Client.SystemReportModalCtrl', function( $scope, $modalInstance, Growls )
{
	this.onSubmit = function()
	{
		Growls.success( 'Your system report has been sent.', 'Sent Report' );
		$modalInstance.close();
	};

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
