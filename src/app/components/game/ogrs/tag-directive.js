angular.module( 'App.Game.Ogrs' ).directive( 'gjGameOgrsTag', function()
{
	return {
		restrict: 'E',
		scope: {
			game: '=gjGame',
		},
		templateUrl: '/app/components/game/ogrs/tag.html',
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope )
		{
			// List them out so they get revisioned.
			var imgPaths = {
				'all-ages': '/app/components/game/ogrs/all-ages-tag.png',
				'teen': '/app/components/game/ogrs/teen-tag.png',
				'mature': '/app/components/game/ogrs/mature-tag.png',
			};

			this.imgTag = undefined;
			this.imgTagUrl = undefined;

			if ( this.game.tigrs_age === 1 ) {
				this.imgTag = 'all-ages';
			}
			else if ( this.game.tigrs_age === 2 ) {
				this.imgTag = 'teen';
			}
			else if ( this.game.tigrs_age === 3 ) {
				this.imgTag = 'mature';
			}

			this.imgTagUrl = imgPaths[ this.imgTag ];
		}
	};
} );
