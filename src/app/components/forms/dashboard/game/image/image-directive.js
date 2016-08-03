angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameImage', function( Form, Api )
{
	var form = new Form( {
		model: 'Game_Screenshot',
		template: '/app/components/forms/dashboard/game/image/image.html',
		resetOnSubmit: true,
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		// Set the game ID on the screenshot form model from the game passed in.
		scope.formModel.game_id = scope.game.id;

		// Only on adding can they send in the file.
		if ( scope.method == 'add' ) {
			if ( !scope.isLoaded ) {
				Api.sendRequest( '/web/dash/developer/games/media/save/image/' + scope.formModel.game_id )
					.then( function( payload )
					{
						scope.isLoaded = true;
						angular.extend( scope, payload );
					} );
			}
		}
		else {
			scope.isLoaded = true;
		}
	};

	return form;
} );
