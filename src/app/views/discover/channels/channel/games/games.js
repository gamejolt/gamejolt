angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels.channel.games', {
		abstract: true,
		controller: 'Discover.Channels.Channel.GamesCtrl',
		controllerAs: 'gamesCtrl',
		templateUrl: '/app/views/discover/channels/channel/games/games.html',
		resolve: {

			// We need translations loaded in for the filtering container, so we wait for "init".
			filteringContainer: function( init, Game_Filtering_Container )
			{
				return new Game_Filtering_Container();
			}
		}
	} );
} );
