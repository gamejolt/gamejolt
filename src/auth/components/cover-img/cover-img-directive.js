angular.module( 'App.CoverImg' ).directive( 'gjCoverImg', function( ImgHelper )
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./cover-img.html' ),
		scope: {
			imgUrl: '@coverImgUrl',
		},
		link: function( scope, element )
		{
			scope.loaded = false;

			scope.$watch( 'imgUrl', function( imgUrl )
			{
				scope.loaded = false;
				ImgHelper.loaded( imgUrl ).then( function()
				{
					scope.loaded = true;
				} );
			} );
		}
	};
} );
