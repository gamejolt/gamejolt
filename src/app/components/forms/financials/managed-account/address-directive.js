angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancialsManagedAccountAddress', function()
{
	return {
		scope: true,
		template: require( '!html-loader!./address.html' ),
		controllerAs: ',
		controller: function( $scope, $attrs, Geo )
		{
			$scope.Geo = Geo;

			this.isForceRequired = angular.isDefined( $attrs.forceRequired );

			var _this = this;
			$attrs.$observe( 'namePrefix', function( val )
			{
				_this.namePrefix = val;
				_this.namePrefixDotted = val.replace( /\-/g, '.' );
			} );

			this.countries = Geo.getCountries();
		},
	};
} );
