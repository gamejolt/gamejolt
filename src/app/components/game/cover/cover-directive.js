angular.module( 'App.Game.Cover' ).directive( 'gjGameCover', function( $timeout, ImgHelper, Ruler )
{
	return {
		restrict: 'E',
		scope: {
			game: '=gjGame',
			shouldParallax: '=?shouldParallax',
		},
		templateUrl: '/app/components/game/cover/cover.html',
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope, $element, Screen )
		{
			var _this = this;
			var elem = $element[0];

			this.isLoaded = false;

			if ( angular.isUndefined( this.shouldParallax ) ) {
				this.shouldParallax = true;
			}

			function setDimensions()
			{
				if ( _this.game.header_media_item ) {
					var header = _this.game.header_media_item;
					var newDimensions = header.getDimensions( Ruler.width( elem ), null, { force: true } );

					// We extend the header to the right and left by 20% on XS since the screen is so small.
					// This makes sure that we also calculate the height larger.
					if ( Screen.isXs ) {
						newDimensions.height *= 1.4;
					}

					elem.style.height = newDimensions.height + 'px';
				}
				else {
					// Make sure it's collapsed if there is no header.
					elem.style.height = 0;
				}
			}

			$scope.$watch( 'ctrl.isLoaded', function( isLoaded )
			{
				if ( isLoaded ) {
					setDimensions();
				}
			} );

			setDimensions();
			Screen.setResizeSpy( $scope, setDimensions );
		}
	};
} );
