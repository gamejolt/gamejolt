angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameBuildPlatformsValidator', function( $parse, Game_Build )
{
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function( scope, element, attrs, ngModel )
		{
			var model = $parse( attrs.gjFormDashboardGameBuildPlatformsValidator )( scope );

			// Update the model so the validator kicks in whenever value changes.
			scope.$watch( function()
			{
				if ( model.type !== Game_Build.TYPE_DOWNLOADABLE ) {
					return true;
				}

				return !!model.os_windows
					|| !!model.os_mac
					|| !!model.os_linux
					|| !!model.os_windows_64
					|| !!model.os_mac_64
					|| !!model.os_linux_64
					|| !!model.os_other
					;
			},
			function( val )
			{
				ngModel.$setViewValue( val );
			} );

			ngModel.$validators.noPlatforms = function( modelVal, viewVal )
			{
				return viewVal;
			};
		}
	};
} );
