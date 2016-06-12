angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancialsManagedAccountSsn', function()
{
	return {
		scope: true,
		templateUrl: '/app/components/forms/dashboard/financials/managed-account/ssn.html',
		controllerAs: '$ctrl',
		controller: function( $scope, $attrs )
		{
			var _this = this;
			$attrs.$observe( 'namePrefix', function( val )
			{
				_this.namePrefix = val;
				_this.namePrefixDotted = val.replace( /\-/g, '.' );
			} );
		}
	};
} );
