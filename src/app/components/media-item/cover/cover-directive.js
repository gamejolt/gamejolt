angular.module( 'App.MediaItem.Cover' ).component( 'gjMediaItemCover', {
	templateUrl: '/app/components/media-item/cover/cover.html',
	transclude: true,
	bindings: {
		mediaItem: '<',
		shouldParallax: '<?',
	},
	controller: function( $scope, $element, Screen, Ruler )
	{
		var _this = this;
		var elem = $element[0];

		this.isLoaded = false;
		this.setDimensions = setDimensions;

		if ( angular.isUndefined( this.shouldParallax ) ) {
			this.shouldParallax = true;
		}

		$scope.$watch( '$ctrl.isLoaded', function( isLoaded )
		{
			if ( isLoaded ) {
				_this.setDimensions();
			}
		} );

		this.setDimensions();
		Screen.setResizeSpy( $scope, setDimensions );

		function setDimensions()
		{
			if ( this.mediaItem ) {
				var newDimensions = this.mediaItem.getDimensions( Ruler.width( elem ), null, { force: true } );

				console.log( Ruler.width( elem ) );

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
	}
} );
