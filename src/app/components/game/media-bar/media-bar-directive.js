angular.module( 'App.Game.MediaBar' ).directive( 'gjGameMediaBar', function()
{
	return {
		restrict: 'E',
		scope: {
			mediaItems: '=gjMediaBarItems'
		},
		templateUrl: '/app/components/game/media-bar/media-bar.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $location, $timeout, Screen, Translate, Analytics )
		{
			var _this = this;

			$scope.Screen = Screen;

			this.activeItem = undefined;
			this.activeIndex = undefined;
			this.isPlaying = undefined;

			this.setActiveItem = function( item )
			{
				var index = item;
				if ( angular.isObject( item ) ) {
					index = _.findIndex( this.mediaItems, { id: item.id } );
				}

				this.go( index );
				Analytics.trackEvent( 'media-bar', 'item-click', index );
			};

			this.goNext = function()
			{
				this.go( Math.min( (this.mediaItems.length - 1), this.activeIndex + 1 ) );
				Analytics.trackEvent( 'media-bar', 'next' );
			};

			this.goPrev = function()
			{
				this.go( Math.max( 0, this.activeIndex - 1 ) );
				Analytics.trackEvent( 'media-bar', 'prev' );
			};

			this.go = function( index )
			{
				this.activeIndex = index;
				this.activeItem = this.mediaItems[ this.activeIndex ];
				this.isPlaying = this.activeIndex;
			};

			this.clearActiveItem = function()
			{
				this.activeItem = undefined;
				this.activeIndex = undefined;
				this.isPlaying = undefined;
				Analytics.trackEvent( 'media-bar', 'close' );
			};

			// If there is a hash in the URL, let's try to load it in.
			var id;
			var hash = $location.hash();
			if ( hash ) {
				if ( hash.indexOf( 'screenshot-' ) !== -1 ) {
					id = parseInt( hash.substring( 'screenshot-'.length ) );
					var type = 'image';
				}
				else if ( hash.indexOf( 'video-' ) !== -1 ) {
					id = parseInt( hash.substring( 'video-'.length ) );
					var type = 'video';
				}

				if ( id ) {
					var item = _.find( this.mediaItems, { id: id } );
					if ( item ) {
						this.setActiveItem( item );
						Analytics.trackEvent( 'media-bar', 'permalink' );
					}
					else {
						Translate.growl( 'error', 'games.view.media.invalid_' + type );
						Analytics.trackEvent( 'media-bar', 'permalink-invalid' );
					}
				}
			}
		}
	};
} );
