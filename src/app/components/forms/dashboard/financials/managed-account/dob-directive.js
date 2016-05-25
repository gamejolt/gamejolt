angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardFinancialsManagedAccountDob', function()
{
	return {
		scope: true,
		templateUrl: '/app/components/forms/dashboard/financials/managed-account/dob.html',
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

			this.days = [];
			for ( var i = 1; i <= 31; ++i ) {
				this.days.push( '' + i );
			}

			this.years = [];
			var maxYear = (new Date()).getFullYear() - 13;
			for ( var i = maxYear; i > maxYear - 100; --i ) {
				this.years.push( '' + i );
			}
		}
	};
} );
