angular.module( 'App.Game.MediaBar' ).directive( 'gjGameMediaBarLightboxItem', function( $window, $timeout, Screen, GameMediaBarLightboxConfig )
{
	return {
		restrict: 'E',
		require: '^^gjGameMediaBarLightbox',
		scope: {
			item: '=',
			maxHeight: '=',
			maxWidth: '=',
			itemIndex: '=',
			activeIndex: '=',
			mediaBarCtrl: '=mediaBar',
		},
		templateUrl: '/app/components/game/media-bar/lightbox/item/item.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element )
		{
			var _this = this;
			var elem = $element[0];

			this.lightboxCtrl = $scope.$parent.ctrl;

			this.isActive = false;
			this.isNext = false;
			this.isPrev = false;

			this.maxWidth = undefined;
			this.maxHeight = undefined;

			this.play = function()
			{
				this.mediaBarCtrl.isPlaying = this.itemIndex;
			};

			this.init = function()
			{
				this.calcActive();
				this.calcDimensions();
			};

			this.calcDimensions = function()
			{
				this.maxWidth = this.lightboxCtrl.maxItemWidth - GameMediaBarLightboxConfig.itemPadding;
				this.maxHeight = this.lightboxCtrl.maxItemHeight;

				var captionElement = elem.getElementsByClassName( 'game-media-bar-lightbox-item-caption' )[0];
				if ( captionElement ) {
					this.maxHeight -= captionElement.offsetHeight;
				}

				if ( this.item.media_type == 'image' ) {
					var dimensions = this.item.media_item.getDimensions( this.maxWidth, this.maxHeight );
					this.maxWidth = dimensions.width;
					this.maxHeight = dimensions.height;
				}
			};

			this.calcActive = function()
			{
				this.isActive = this.activeIndex == this.itemIndex;
				this.isNext = this.activeIndex + 1 == this.itemIndex;
				this.isPrev = this.activeIndex - 1 == this.itemIndex;

				elem.classList.remove( 'active', 'next', 'prev' );

				if ( this.isActive ) {
					elem.classList.add( 'active' );
				}
				else if ( this.isPrev ) {
					elem.classList.add( 'prev' );
				}
				else if ( this.isNext ) {
					elem.classList.add( 'next' );
				}

				if ( this.isActive || this.isNext || this.isPrev ) {

					// Since changing these values affect whether or not the image is loaded (ng-if in the template)
					// we have to wait until angular compiles back in.
					$timeout( function()
					{
						_this.calcDimensions();
					}, 0 );
				}
			};

			$scope.$on( 'MediaBarLightbox.onResize', function()
			{
				_this.calcDimensions();
			} );

			$scope.$watch( 'ctrl.activeIndex', function()
			{
				_this.calcActive();
			} );

			$timeout( function()
			{
				_this.init();
			}, 1 );
		}
	};
} );
