angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancialsManagedAccountIdDocument', function()
{
	return {
		scope: true,
		template: require( '!html-loader!./id-document.html' ),
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
