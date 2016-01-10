angular.module( 'App.Views' ).directive( 'gjDiscoverHomeRow', function()
{
	return {
		restrict: 'E',
		scope: {
			games: '=?gjGames',
			posts: '=?gjPosts',
		},
		templateUrl: '/app/components/discover/home/row/row.html',
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, $element, Screen )
		{
			var _this = this;
			$scope.Screen = Screen;

			this.currentSlide = 0;

			this.numSlides = 0;
			this.numPerSlide = 0;
			this.slides = [];

			this.calculateSlideNumbers = function()
			{
				if ( Screen.isSm ) {
					this.numSlides = 4;
					this.numPerSlide = 3;
					this.slides = [ 0, 1, 2, 3 ];
				}
				else {
					this.numSlides = 3;
					this.numPerSlide = 4;
					this.slides = [ 0, 1, 2 ];

					// If they were on the last slide on a SM screen but then switched
					// then the last slide no longer exists since we can show more on the screen at
					// a time. So put them to the new end.
					if ( this.currentSlide == 3 ) {
						this.currentSlide = 2;
						this.updateSliderOffset();
					}
				}
			};

			this.nextSlide = function()
			{
				++this.currentSlide;
				this.updateSliderOffset();
			};

			this.prevSlide = function()
			{
				--this.currentSlide;
				this.updateSliderOffset();
			};

			this.updateSliderOffset = function()
			{
				var sliderElem = $element[0].getElementsByClassName( 'discover-home-row-slider' )[0];
				sliderElem.style.transform = 'translate3d( ' + (this.currentSlide * -100) + '%, 0, 0 )';
			};

			this.calculateSlideNumbers();
			$scope.$watch( 'Screen.breakpoint', function()
			{
				_this.calculateSlideNumbers();
			} );
		}
	};
} );
