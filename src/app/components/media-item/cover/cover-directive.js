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

		// isLoaded gets set the first time it loads and stays set
		// isMediaItemLoaded gets changed every time a new size loads in
		this.isLoaded = false;
		this.isMediaItemLoaded = false;

		this.setDimensions = setDimensions;

		if ( angular.isUndefined( this.shouldParallax ) ) {
			this.shouldParallax = true;
		}

		// We watch for when a new media item loads in.
		$scope.$watch( '$ctrl.isMediaItemLoaded', function( isLoaded )
		{
			if ( isLoaded ) {
				_this.setDimensions();
				_this.isLoaded = true;
			}
		} );

		this.setDimensions();
		Screen.setResizeSpy( $scope, function()
		{
			_this.setDimensions();
		} );

		function setDimensions()
		{
			if ( this.mediaItem ) {
				var newDimensions = this.mediaItem.getDimensions( Ruler.width( elem ), null, { force: true } );

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
