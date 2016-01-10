angular.module( 'App.Game.MediaBar' ).directive( 'gjGameMediaBarLightbox', function( $timeout, $animate, $document )
{
	return {
		restrict: 'E',
		require: '^^gjGameMediaBar',
		scope: {},
		templateUrl: '/app/components/game/media-bar/lightbox/lightbox.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element, $window, $location, Screen, hotkeys, GameMediaBarLightboxConfig, Analytics )
		{
			var _this = this;
			var padding;
			var elem = $element[0];
			var sliderElem = elem.getElementsByClassName( 'game-media-bar-lightbox-slider' )[0];

			this.currentSliderOffset = 0;

			this.init = function()
			{
				this.calcMaxDimensions();
				this.refreshSliderPosition();
				this.syncUrl();
			};

			this.calcMaxDimensions = function()
			{
				this.maxItemWidth = (Screen.windowWidth * 0.8);
				this.maxItemHeight = Screen.windowHeight - (GameMediaBarLightboxConfig.controlsHeight * 2);
			};

			this.goNext = function()
			{
				$scope.mediaBarCtrl.goNext();
				_this.refreshSliderPosition();
				_this.syncUrl();
			};

			this.goPrev = function()
			{
				$scope.mediaBarCtrl.goPrev();
				_this.refreshSliderPosition();
				_this.syncUrl();
			};

			this.close = function()
			{
				$scope.mediaBarCtrl.clearActiveItem();
				_this.syncUrl();
			};

			this.syncUrl = function()
			{
				var hash = '';

				if ( $scope.mediaBarCtrl.activeItem ) {
					if ( $scope.mediaBarCtrl.activeItem.media_type == 'image' ) {
						hash = 'screenshot-';
					}
					else if ( $scope.mediaBarCtrl.activeItem.media_type == 'video' ) {
						hash = 'video-';
					}
					hash += $scope.mediaBarCtrl.activeItem.id;
				}
				else {
					// TODO: Remove this once angular fixes its business.
					hash = 'close';
				}

				// Replace the URL. This way people can link to it by pulling from the browser bar,
				// but we don't want it to mess up their history navigating after closing.
				$location.hash( hash ).replace();
			};

			this.refreshSliderPosition = function()
			{
				var padding = Screen.windowWidth * 0.1;

				if ( $scope.mediaBarCtrl.activeIndex == 0 ) {
					var newOffset = padding;
				}
				else {
					var newOffset = -(this.maxItemWidth * $scope.mediaBarCtrl.activeIndex - padding);
				}

				sliderElem.style.transform = 'translate3d( ' + newOffset + 'px, 0, 0 )';
				this.currentSliderOffset = newOffset;
			}

			var activeElem, nextElem, prevElem;
			var isDragging = false;
			var waitingForFrame = false;

			this.panStart = function( $event )
			{
				isDragging = true;

				activeElem = elem.getElementsByClassName( 'active' )[0];
				nextElem = elem.getElementsByClassName( 'next' )[0];
				prevElem = elem.getElementsByClassName( 'prev' )[0];

				elem.classList.add( 'dragging' );
			};

			this.pan = function( $event )
			{
				if ( !waitingForFrame ) {
					waitingForFrame = true;
					$window.requestAnimationFrame( function()
					{
						panTick( $event );
					} );
				}
			};

			function panTick( $event )
			{
				waitingForFrame = false;

				// In case the animation frame was retrieved after we stopped dragging.
				if ( !isDragging ) {
					return;
				}

				sliderElem.style.transform = 'translate3d( ' + (_this.currentSliderOffset + $event.deltaX) + 'px, 0, 0 )';

				var slidePercent = Math.abs( $event.deltaX ) / (Screen.windowWidth * 0.8);
				var opacity = GameMediaBarLightboxConfig.opacityStart + (slidePercent * (1 - GameMediaBarLightboxConfig.opacityStart));
				var scale = GameMediaBarLightboxConfig.scaleStart + (slidePercent * (1 - GameMediaBarLightboxConfig.scaleStart));

				if ( nextElem ) {
					nextElem.style.opacity = opacity;
					nextElem.style.transform = 'scale( ' + scale + ', ' + scale + ' )';
				}

				if ( prevElem ) {
					prevElem.style.opacity = opacity;
					prevElem.style.transform = 'scale( ' + scale + ', ' + scale + ' )';
				}

				// Do the inverse of what we do with the adjacent siblings.
				activeElem.style.opacity = ((1 + GameMediaBarLightboxConfig.opacityStart) - opacity);
				activeElem.style.transform = 'scale( ' + ((1 + GameMediaBarLightboxConfig.scaleStart) - scale) + ', ' + ((1 + GameMediaBarLightboxConfig.scaleStart) - scale) + ' )';
			}

			this.panEnd = function( $event )
			{
				isDragging = false;

				$scope.$apply( function()
				{
					elem.classList.remove( 'dragging' );

					activeElem.style.opacity = '';
					if ( prevElem ) {
						prevElem.style.opacity = '';
					}

					if ( nextElem ) {
						nextElem.style.opacity = '';
					}

					activeElem.style.transform = '';
					if ( prevElem ) {
						prevElem.style.transform = '';
					}

					if ( nextElem ) {
						nextElem.style.transform = '';
					}

					// Make sure we moved at a high enough velocity and distance to register the "swipe".
					var velocity = $event.velocityX;
					if ( Math.abs( velocity ) > 0.65 && $event.distance > 10 ) {
						if ( velocity > 0 ) {
							_this.goNext();
							Analytics.trackEvent( 'media-bar', 'swiped-next' );
						}
						else {
							_this.goPrev();
							Analytics.trackEvent( 'media-bar', 'swiped-prev' );
						}
						return;
					}

					// We don't change the active item and instead just refresh the slider position.
					// This should reset the position after us moving it in drag().
					_this.refreshSliderPosition();
				} );
			};

			Screen.setResizeSpy( $scope, function()
			{
				_this.calcMaxDimensions();
				_this.refreshSliderPosition();

				// We have to do it after the changes are applied to the dom, since the
				// max width/height get passed to items through the DOM.
				$timeout( function()
				{
					$scope.$broadcast( 'MediaBarLightbox.onResize' );
				}, 1 );
			} );

			hotkeys.bindTo( $scope ).add( {
				combo: 'right',
				description: 'Next item.',
				callback: function( $event )
				{
					_this.goNext();
					$event.preventDefault();
				}
			} )
			.add( {
				combo: 'left',
				description: 'Previous item.',
				callback: function( $event )
				{
					_this.goPrev();
					$event.preventDefault();
				}
			} )
			.add( {
				combo: 'esc',
				description: 'Close media lightbox.',
				callback: function( $event )
				{
					_this.close();
					$event.preventDefault();
				}
			} );
		},
		link: function( scope, element, attrs, mediaBarCtrl )
		{
			scope.mediaBarCtrl = mediaBarCtrl;

			// Wait to initialize everything until after we have the mediaBarCtrl reference.
			scope.ctrl.init();

			// Move it to the body.
			// This should fix the z-indexing and put it on top of the whole shell.
			$document[0].body.appendChild( element[0] );

			// Since we're on the body now, we have to remember to manually remove the element
			// when the scope is destroyed.
			scope.$on( '$destroy', function()
			{
				// Don't do the leave if the animation system will do it automatically.
				// This is when the ng-if triggers.
				// But when we change views, the element seems to stay.
				$timeout( function()
				{
					if ( !element[0].classList.contains( 'ng-leave' ) ) {
						$animate.leave( element );
					}
				}, 0, false );
			} );
		}
	};
} );
