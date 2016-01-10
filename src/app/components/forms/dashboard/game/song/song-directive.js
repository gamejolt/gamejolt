angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameSong', function( Form, Api )
{
	var form = new Form( {
		model: 'Game_Song',
		template: '/app/components/forms/dashboard/game/song/song.html',
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		scope.formModel.file = undefined;
		scope.formModel.game_id = scope.game.id;

		if ( !scope.isLoaded ) {
			Api.sendRequest( '/web/dash/developer/games/music/save/' + scope.formModel.game_id ).then( function( payload )
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );
			} );
		}
	};

	return form;
} );
