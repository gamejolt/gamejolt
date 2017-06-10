angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancialsManagedAccountSsn', function()
{
	return {
		scope: true,
		template: require( '!html-loader!./ssn.html' ),
		controllerAs: ',
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
