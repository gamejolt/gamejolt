angular.module( 'App.Game.MediaBar' ).directive( 'gjGameMediaBarItem', function( App, Screen )
{
	return {
		restrict: 'E',
		require: '^^gjGameMediaBar',
		scope: {
			item: '='
		},
		templateUrl: '/app/components/game/media-bar/item/item.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element, Analytics )
		{
			var elem = $element[0];

			this.loaded = false;

			// We set the dimensions on the thumbnails manually.
			// This way we can size it correct before it loads.
			if ( this.item.media_type == 'image' ) {
				var dimensions = this.item.media_item.getDimensions( 400, 150 );
				elem.style.width = dimensions.width + 'px';
				elem.style.height = dimensions.height + 'px';
			}
			else {
				// Video/sketchfab thumbnails are hardcoded to this width.
				elem.style.width = '200px';
			}

			this.onClick = function()
			{
				// Lightbox is turned off on mobile.
				if ( !Screen.isXs ) {
					$scope.mediaBarCtrl.setActiveItem( this.item );
				}
				else {
					Analytics.trackEvent( 'media-bar', 'item-click-mobile' );
				}
			};

			$scope.$watch( 'ctrl.loaded', function( isLoaded )
			{
				if ( isLoaded ) {
					elem.classList.add( 'loaded' );
				}
				else {
					elem.classList.remove( 'loaded' );
				}
			} );
		},
		compile: function( element, attrs )
		{
			element[0].classList.add( 'game-media-bar-item' );

			return {
				pre: function( scope, element, attrs, mediaBarCtrl )
				{
					scope.mediaBarCtrl = mediaBarCtrl;
				}
			};
		}
	};
} );
