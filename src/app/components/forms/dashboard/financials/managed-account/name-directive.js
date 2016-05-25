angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancialsManagedAccountName', function()
{
	return {
		scope: true,
		templateUrl: '/app/components/forms/dashboard/financials/managed-account/name.html',
		controllerAs: '$ctrl',
		controller: function( $scope, $attrs )
		{
			this.isForceRequired = angular.isDefined( $attrs.forceRequired );
			
			var _this = this;
			$attrs.$observe( 'namePrefix', function( val )
			{
				_this.namePrefix = val;
				_this.namePrefixDotted = val.replace( /\-/g, '.' );
			} );
		}
	};
} );
