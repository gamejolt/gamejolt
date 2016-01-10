angular.module( 'App.Game.Thumbnail' ).directive( 'gjGameThumbnail', function( $sce, $interpolate, $parse )
{
	var definition = {
		restrict: 'E',
		templateUrl: '/app/components/game/thumbnail/thumbnail.html',
		scope: {},
		bindToController: {
			game: '=gjGame',
		},
		controllerAs: 'ctrl',
		compile: function( element, attrs )
		{
			attrs.linkToInterpolated = attrs.gjLinkTo ? $interpolate( attrs.gjLinkTo ) : undefined;

			// Optional control.
			attrs.showControlInterpolated = attrs.gameThumbnailShowControl ? $interpolate( attrs.gameThumbnailShowControl ) : undefined;
			attrs.controlLabelInterpolated = attrs.gameThumbnailControlLabel ? $interpolate( attrs.gameThumbnailControlLabel ) : undefined;
			attrs.onControlClickParsed = attrs.gameThumbnailOnControlClick ? $parse( attrs.gameThumbnailOnControlClick ) : undefined;
		},
		controller: [ '$scope', '$element', '$attrs', 'Screen', GameThumbnailCtrl ],
	};

	function GameThumbnailCtrl( $scope, $element, $attrs, Screen )
	{
		$scope.Screen = Screen;

		var elem = $element[0];

		if ( $attrs.linkToInterpolated && $attrs.linkToInterpolated( $scope.$parent ) == 'dashboard' ) {
			this.url = this.game.getUrl( 'dashboard' );
		}
		else {
			this.url = this.game.getUrl();
		}

		if ( this.game.has_animated_thumbnail ) {

			this.webm = $sce.trustAsResourceUrl( this.game.img_thumbnail_webm );
			this.mp4 = $sce.trustAsResourceUrl( this.game.img_thumbnail_mp4 );

			// Gotta wait for the video elements to compile into the view.
			$scope.$applyAsync( function()
			{
				var $thumb = angular.element( elem.getElementsByClassName( 'game-thumbnail' )[0] );

				$thumb.on( 'mouseenter', function()
				{
					var videoElem = elem.getElementsByTagName( 'video' )[0];
					elem.classList.add( 'show-video' );
					videoElem.play();
				} );

				$thumb.on( 'mouseleave', function()
				{
					var videoElem = elem.getElementsByTagName( 'video' )[0];
					elem.classList.remove( 'show-video' );
					videoElem.currentTime = 0;
					videoElem.pause();
				} );
			} );
		}

		// Optional control.
		this.showControl = false;
		this.controlType = $attrs.showControlInterpolated ? $attrs.showControlInterpolated( $scope.$parent ) : undefined;

		if ( this.controlType ) {
			this.showControl = true;
			this.controlLabel = $attrs.controlLabelInterpolated( $scope.$parent );
			this.onControlClickParsed = $attrs.onControlClickParsed;
			this.$scope = $scope;
		}
	}

	GameThumbnailCtrl.prototype.onControlClicked = function( $event )
	{
		if ( this.showControl ) {

			// Since the button is technically in an A tag.
			$event.stopPropagation();
			$event.preventDefault();

			if ( this.onControlClickParsed ) {
				this.onControlClickParsed( this.$scope.$parent );
			}
		}
	};

	return definition;
} );
