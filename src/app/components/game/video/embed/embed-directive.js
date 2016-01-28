angular.module( 'App.Game.Video.Embed' ).directive( 'gjGameVideoEmbed', function( $sce, $rootScope, Screen, Ruler, Game_Video )
{
	var VIDEO_RATIO = 0.5625;  // 16:9

	return {
		restrict: 'E',
		scope: {
			video: '=gjGameVideo',
			maxVideoHeight: '@?gjMaxVideoHeight',
			maxVideoWidth: '@?gjMaxVideoWidth',
			autoplay: '=?autoplay',
		},
		templateUrl: '/app/components/game/video/embed/embed.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element )
		{
			var _this = this;

			$scope.Game_Video = Game_Video;

			this.embedUrl = undefined;

			$scope.$watch( 'ctrl.video.url', function( url )
			{
				if ( _this.video.type == Game_Video.TYPE_YOUTUBE ) {
					url = 'https://www.youtube.com/embed/' + url;
				}
				else if ( _this.video.type == Game_Video.TYPE_VIMEO ) {
					url = 'https://player.vimeo.com/video/' + url;
				}

				if ( _this.autoplay ) {
					url += '?autoplay=1';
				}

				_this.embedUrl = $sce.trustAsResourceUrl( url );
			} );

			function recalculateDimensions()
			{
				_this.width = Ruler.width( $element[0].getElementsByClassName( 'game-video-embed-inner' )[0] );

				if ( _this.maxVideoWidth ) {
					_this.width = Math.min( _this.maxVideoWidth, _this.width );
				}

				_this.height = _this.width * VIDEO_RATIO;

				if ( _this.maxVideoHeight && _this.height > _this.maxVideoHeight ) {
					_this.height = _this.maxVideoHeight;
					_this.width = _this.height / VIDEO_RATIO;
				}
			};

			recalculateDimensions();
			Screen.setResizeSpy( $scope, recalculateDimensions );
		}
	};
} );
