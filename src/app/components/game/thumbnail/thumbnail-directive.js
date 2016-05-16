(function() {

angular.module( 'App.Game.Thumbnail' ).component( 'gjGameThumbnail', {
	bindings: {
		game: '<gjGame',
		linkTo: '@?gjLinkTo',
		controlType: '@?gameThumbnailShowControl',
		controlLabel: '@?gameThumbnailControlLabel',
		_onControlClick: '&?gameThumbnailOnControlClick',
		autoplay: '<?autoplay',
	},
	templateUrl: '/app/components/game/thumbnail/thumbnail.html',
	controller: GameThumbnailCtrl,
} );

function GameThumbnailCtrl( $scope, $element, $sce, Screen )
{
	this.Screen = Screen;
	this.$scope = $scope;

	this.elem = $element[0];

	if ( this.linkTo == 'dashboard' ) {
		this.url = this.game.getUrl( 'dashboard' );
	}
	else {
		this.url = this.game.getUrl();
	}

	this.showControl = false;
	if ( this.controlType ) {
		this.showControl = true;
	}

	if ( this.game.has_animated_thumbnail ) {
		this.webm = $sce.trustAsResourceUrl( this.game.img_thumbnail_webm );
		this.mp4 = $sce.trustAsResourceUrl( this.game.img_thumbnail_mp4 );
	}
}

GameThumbnailCtrl.prototype.$postLink = function( $scope )
{
	var _this = this;

	if ( this.game.has_animated_thumbnail ) {
		if ( !this.autoplay || this.Screen.isXs ) {
			var $thumb = angular.element( this.elem.getElementsByClassName( 'game-thumbnail' )[0] );

			$thumb.on( 'mouseenter', function()
			{
				_this.playThumbnail();
			} );

			$thumb.on( 'mouseleave', function()
			{
				_this.stopThumbnail();
			} );
		}
		else {
			this.$scope.$applyAsync( function()
			{
				_this.playThumbnail();
			} );
		}
	}
};

GameThumbnailCtrl.prototype.playThumbnail = function()
{
	var videoElem = this.elem.getElementsByTagName( 'video' )[0];
	this.elem.classList.add( 'show-video' );
	videoElem.play();
};

GameThumbnailCtrl.prototype.stopThumbnail = function()
{
	var videoElem = this.elem.getElementsByTagName( 'video' )[0];
	this.elem.classList.remove( 'show-video' );
	videoElem.currentTime = 0;
	videoElem.pause();
};

GameThumbnailCtrl.prototype.onControlClick = function( $event )
{
	if ( this.showControl ) {

		// Since the button is technically in an A tag.
		$event.stopPropagation();
		$event.preventDefault();

		if ( this._onControlClick ) {
			this._onControlClick( this.$scope.$parent );
		}
	}
};

})();
