angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameNewBuildBrowserTypeValidator', function( $parse, Game_Build )
{
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function( scope, element, attrs, ngModel )
		{
			var validTypesParsed = $parse( attrs.gjFormDashboardGameNewBuildBrowserTypeValidator );

			ngModel.$validators.browserType = function( modelVal, viewVal )
			{
				if ( !viewVal ) {
					return true;
				}

				var file = viewVal[0];
				if ( !file ) {
					return true;
				}

				var validTypes = validTypesParsed( scope );
				var fileType = file.name.slice( file.name.lastIndexOf( '.' ) );
				return validTypes.indexOf( fileType ) !== -1;
			};
		}
	};
} );
