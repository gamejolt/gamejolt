angular.module( 'App.Views' ).directive( 'gjDiscoverHomeFeatured', function()
{
	var SLIDE_TIME = 7;  // In seconds.

	return {
		restrict: 'E',
		scope: {
			items: '=gjItems',
		},
		templateUrl: '/app/components/discover/home/featured/featured.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element, $timeout, $state, $window, Analytics, Screen )
		{
			var _this = this;
			var slideTimeout;

			$scope.Screen = Screen;

			this.index = 0;
			this.item = this.items[0];
			this.animate = true;

			// Starts the process of sliding.
			setupSlideTimeout();

			this.nextSlide = function( $event, options )
			{
				if ( options && options.swipe ) {
					Analytics.trackEvent( 'home', 'featured', 'swipe-next' );
				}

				this.activateSlide( this.index + 1, $event );
			};

			this.prevSlide = function( $event, options )
			{
				if ( options && options.swipe ) {
					Analytics.trackEvent( 'home', 'featured', 'swipe-prev' );
				}

				this.activateSlide( this.index - 1, $event );
			};

			this.activateSlide = function( index, $event )
			{
				if ( slideTimeout ) {
					$timeout.cancel( slideTimeout );
				}
				setupSlideTimeout();

				this.index = index;

				if ( this.index < 0 ) {
					this.index = this.items.length - 1;
				}
				else if ( this.index > this.items.length - 1 ) {
					this.index = 0;
				}

				this.item = this.items[ this.index ];

				if ( $event && $event.stopPropagation ) {
					$event.stopPropagation();
				}
			};

			this.go = function()
			{
				$state.go( this.item.game.getSref(), this.item.game.getSrefParams() );
			};

			function setupSlideTimeout()
			{
				// Gotta make sure to cancel any previously set ones.
				removeSlideTimeout();
				slideTimeout = $timeout( function()
				{
					_this.nextSlide();
				}, SLIDE_TIME * 1000 );
			}

			function removeSlideTimeout()
			{
				if ( slideTimeout ) {
					$timeout.cancel( slideTimeout );
					slideTimeout = null;
				}
			}

			$element.on( 'mouseover', removeSlideTimeout );
			$element.on( 'mouseout', setupSlideTimeout );
			angular.element( $window ).on( 'blur', removeSlideTimeout );
			angular.element( $window ).on( 'focus', setupSlideTimeout );

			$scope.$on( '$destroy', function()
			{
				angular.element( $window ).off( 'blur', removeSlideTimeout );
				angular.element( $window ).off( 'focus', setupSlideTimeout );
				removeSlideTimeout();
			} );
		}
	};
} );
