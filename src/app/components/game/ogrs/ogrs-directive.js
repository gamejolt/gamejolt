angular.module( 'App.Game.Ogrs' ).directive( 'gjGameOgrs', function()
{
	return {
		restrict: 'E',
		scope: {
			game: '=gjGame',
			hideDescriptors: '=?gjHideDescriptors',
			hideTag: '=gjHideTag',
		},
		templateUrl: '/app/components/game/ogrs/ogrs.html',
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope )
		{
			var _this = this;

			// List them out so they get revisioned.
			var imgPaths = {
				'all-ages': '/app/components/game/ogrs/all-ages.png',
				'teen': '/app/components/game/ogrs/teen.png',
				'mature': '/app/components/game/ogrs/mature.png',
			};

			this.imgTag = undefined;
			this.imgTagUrl = undefined;
			this.descriptors = [];

			$scope.$watch( 'ctrl.game.tigrs_age', function()
			{
				_this.imgTag = undefined;
				_this.imgTagUrl = undefined;

				if ( !_this.game ) {
					return;
				}


				if ( _this.game.tigrs_age === 1 ) {
					_this.imgTag = 'all-ages';
				}
				else if ( _this.game.tigrs_age === 2 ) {
					_this.imgTag = 'teen';
				}
				else if ( _this.game.tigrs_age === 3 ) {
					_this.imgTag = 'mature';
				}

				_this.imgTagUrl = imgPaths[ _this.imgTag ];
			} );

			$scope.$watchGroup( [
				'ctrl.hideDescriptors',
				'ctrl.game.tigrs_language',
				'ctrl.game.tigrs_cartoon_violence',
				'ctrl.game.tigrs_fantasy_violence',
				'ctrl.game.tigrs_realistic_violence',
				'ctrl.game.tigrs_bloodshed',
				'ctrl.game.tigrs_sexual_violence',
				'ctrl.game.tigrs_nudity',
				'ctrl.game.tigrs_sexual_themes',
				'ctrl.game.tigrs_humor',
				'ctrl.game.tigrs_alcohol',
				'ctrl.game.tigrs_tobacco',
				'ctrl.game.tigrs_drugs',
				'ctrl.game.tigrs_gambling',
			],
			function()
			{
				_this.descriptors = [];

				if ( !_this.game || _this.hideDescriptors ) {
					return;
				}

				if ( _this.game.tigrs_cartoon_violence ) {
					var descriptor = '';
					if ( _this.game.tigrs_cartoon_violence === 1 ) {
						descriptor = 'Mild ';
					}
					else if ( _this.game.tigrs_cartoon_violence === 3 ) {
						descriptor = 'Intense ';
					}
					_this.descriptors.push( descriptor + 'Cartoon Violence' );
				}

				if ( _this.game.tigrs_fantasy_violence ) {
					var descriptor = '';
					if ( _this.game.tigrs_fantasy_violence === 1 ) {
						descriptor = 'Mild ';
					}
					else if ( _this.game.tigrs_fantasy_violence === 3 ) {
						descriptor = 'Intense ';
					}
					_this.descriptors.push( descriptor + 'Fantasy Violence' );
				}

				if ( _this.game.tigrs_realistic_violence ) {
					var descriptor = '';
					if ( _this.game.tigrs_realistic_violence === 1 ) {
						descriptor = 'Mild ';
					}
					else if ( _this.game.tigrs_realistic_violence === 3 ) {
						descriptor = 'Intense ';
					}
					_this.descriptors.push( descriptor + 'Realistic Violence' );
				}

				if ( _this.game.tigrs_bloodshed ) {
					if ( _this.game.tigrs_bloodshed === 1 ) {
						_this.descriptors.push( 'Animated Bloodshed' );
					}
					else if ( _this.game.tigrs_bloodshed === 2 ) {
						_this.descriptors.push( 'Realistic Bloodshed' );
					}
					else if ( _this.game.tigrs_bloodshed === 3 ) {
						_this.descriptors.push( 'Blood and Gore' );
					}
				}

				if ( _this.game.tigrs_sexual_violence === 1 ) {
					_this.descriptors.push( 'Sexual Violence' );
				}

				if ( _this.game.tigrs_alcohol ) {
					if ( _this.game.tigrs_alcohol === 1 ) {
						_this.descriptors.push( 'Alcohol Reference' );
					}
					else if ( _this.game.tigrs_alcohol === 2 ) {
						_this.descriptors.push( 'Alcohol Use' );
					}
				}

				if ( _this.game.tigrs_drugs ) {
					if ( _this.game.tigrs_drugs === 1 ) {
						_this.descriptors.push( 'Drug Reference' );
					}
					else if ( _this.game.tigrs_drugs === 2 ) {
						_this.descriptors.push( 'Drug Use' );
					}
				}

				if ( _this.game.tigrs_tobacco ) {
					if ( _this.game.tigrs_tobacco === 1 ) {
						_this.descriptors.push( 'Tobacco Reference' );
					}
					else if ( _this.game.tigrs_tobacco === 2 ) {
						_this.descriptors.push( 'Tobacco Use' );
					}
				}

				if ( _this.game.tigrs_nudity ) {
					if ( _this.game.tigrs_nudity === 1 ) {
						_this.descriptors.push( 'Brief Nudity' );
					}
					else if ( _this.game.tigrs_nudity === 2 ) {
						_this.descriptors.push( 'Nudity' );
					}
				}

				if ( _this.game.tigrs_sexual_themes ) {
					if ( _this.game.tigrs_sexual_themes === 1 ) {
						_this.descriptors.push( 'Suggestive Themes' );
					}
					else if ( _this.game.tigrs_sexual_themes === 2 ) {
						_this.descriptors.push( 'Sexual Themes' );
					}
					else if ( _this.game.tigrs_sexual_themes === 3 ) {
						_this.descriptors.push( 'Graphic Sexual Themes' );
					}
				}

				if ( _this.game.tigrs_language ) {
					var descriptor = '';
					if ( _this.game.tigrs_language === 1 ) {
						descriptor = 'Mild ';
					}
					else if ( _this.game.tigrs_language === 3 ) {
						descriptor = 'Strong ';
					}
					_this.descriptors.push( descriptor + 'Language' );
				}

				if ( _this.game.tigrs_humor ) {
					if ( _this.game.tigrs_humor === 1 ) {
						_this.descriptors.push( 'Comical Shenanigans' );
					}
					else if ( _this.game.tigrs_humor === 2 ) {
						_this.descriptors.push( 'Crass Humor' );
					}
					else if ( _this.game.tigrs_humor === 3 ) {
						_this.descriptors.push( 'Mature Humor' );
					}
				}

				if ( _this.game.tigrs_gambling ) {
					var descriptor = '';
					if ( _this.game.tigrs_gambling === 1 ) {
						descriptor = 'Simulated ';
					}
					else if ( _this.game.tigrs_gambling === 3 ) {
						descriptor = 'Real ';
					}
					_this.descriptors.push( descriptor + 'Gambling' );
				}
			} );
		}
	};
} );
