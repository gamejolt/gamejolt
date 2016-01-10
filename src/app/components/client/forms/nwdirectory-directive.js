/**
 * Angular doesn't trigger changes for file inputs.
 * We need to sync the chosen directory for nwdirectory attr files, though.
 */
angular.module( 'App.Client.Forms' ).directive( 'nwdirectory', function()
{
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function( scope, element, attrs, ngModel )
		{
			element.bind( 'change', function()
			{
				scope.$apply( function()
				{
					ngModel.$setViewValue( element.val() );
				} );
			} );
		}
	};
} );