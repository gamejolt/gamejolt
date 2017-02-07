angular.module( 'App.Trophy.Overview' ).directive( 'gjTrophyOverview', function()
{
	return {
		restrict: 'E',
		template: require( '!html-loader!./overview.html' ),
		scope: {
			game: '=trophyOverviewGame',
			initialPayload: '=?trophyOverviewPayload',
			size: '@?trophyOverviewSize',
		},
		bindToController: true,
		controllerAs: 'ctrl',
		controller: function( $scope, App, Screen, Game_Trophy, User_GameTrophy )
		{
			var _this = this;

			$scope.App = App;
			$scope.Screen = Screen;

			if ( !this.size ) {
				this.size = 'full';
			}

			if ( this.size == 'full' ) {

				// If the user is logged in, we will show their completion widget on the right for LG screens.
				// In that case we show larger LG thumbs.
				if ( App.user ) {
					this.desktopThumbSizes = 'col-md-2 col-lg-2';
				}
				// Otherwise it stretches across the full view and we show smaller.
				else {
					this.desktopThumbSizes = 'col-md-2 col-lg-1';
				}
			}
			else {
				this.desktopThumbSizes = 'col-md-3 col-lg-3';
			}

			function processPayload( payload )
			{
				_this.trophies = Game_Trophy.populate( payload.trophies );
				_this.showInvisibleTrophyMessage = payload.trophiesShowInvisibleTrophyMessage || false;
				_this.experience = payload.trophiesExperienceAchieved || 0;

				_this.achieved = payload.trophiesAchieved ? User_GameTrophy.populate( payload.trophiesAchieved ) : [];
				_this.achievedIndexed = Game_Trophy.indexAchieved( _this.achieved );
			};

			function getNumberToShow()
			{
				if ( Screen.isXs ) {
					_this.numberToShow = 6;
				}
				else {
					if ( _this.size == 'full' ) {
						if ( Screen.isLg ) {
							if ( App.user ) {
								_this.numberToShow = 12;
							}
							else {
								_this.numberToShow = 24;
							}
						}
						else {
							_this.numberToShow = 12;
						}
					}
					else {
						if ( Screen.isDesktop ) {
							_this.numberToShow = 16;
						}
						else {
							_this.numberToShow = 12;
						}
					}
				}

				_this.extraCount = Math.max( 0, _this.trophies.length - _this.numberToShow );
			}

			processPayload( this.initialPayload );
			getNumberToShow();

			$scope.$watch( 'Screen.breakpoint', getNumberToShow );
		}
	};
} );
