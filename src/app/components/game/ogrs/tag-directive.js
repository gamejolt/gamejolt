angular.module( 'App.Game.Ogrs' ).directive( 'gjGameOgrsTag', function()
{
	return {
		restrict: 'E',
		scope: {
			game: '=gjGame',
		},
		template: require( '!html-loader!./tag.html' ),
		controllerAs: 'ctrl',
		bindToController: true,
		controller: function( $scope )
		{
			// List them out so they get revisioned.
			var imgPaths = {
				'all-ages': require( './all-ages-tag.png' ),
				'teen': require( './teen-tag.png' ),
				'mature': require( './mature-tag.png' ),
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
