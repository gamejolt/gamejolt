angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameRelease', function( Form, Api, Game_Release )
{
	var form = new Form( {
		model: 'Game_Release',
		template: '/app/components/forms/dashboard/game/release/release.html',
	} );

	form.scope.game = '=gjGame';
	form.scope.package = '=?gjGamePackage';

	form.onInit = function( scope )
	{
		scope.formModel.game_id = scope.game.id;
		scope.formModel.game_package_id = scope.package.id;

		scope.Game_Release = Game_Release;

		if ( !scope.isLoaded ) {
			Api.sendRequest( '/web/dash/developer/games/releases/save/' + scope.game.id + '/' + scope.package.id ).then( function( payload )
			{
				scope.isLoaded = true;

				if ( scope.method == 'add' ) {
					scope.formModel.version_number = payload.nextVersion || '0.1.0';
				}
			} );
		}
	};

	return form;
} );
