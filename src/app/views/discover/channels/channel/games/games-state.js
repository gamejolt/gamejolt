angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels.channel.games', {
		abstract: true,
		controller: 'Discover.Channels.Channel.GamesCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/discover/channels/channel/games/games.html',
		resolve: {

			// We need translations loaded in for the filtering container, so we wait for "init".
			filteringContainer: function( init, Game_Filtering_Container )
			{
				var filteringContainer = new Game_Filtering_Container();

				// TODO: When devlogs get pushed out, remove this.
				filteringContainer.isPersistent = false;
				filteringContainer.shouldDetect = false;

				return filteringContainer;
			}
		}
	} );
} );
