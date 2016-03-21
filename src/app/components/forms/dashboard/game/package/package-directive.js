angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGamePackage', function( Form, Api, Game_Package )
{
	var form = new Form( {
		model: 'Game_Package',
		template: '/app/components/forms/dashboard/game/package/package.html',
		resetOnSubmit: true,
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		scope.formModel.game_id = scope.game.id;

		scope.formState.showDescriptionInput = scope.formModel.description ? true : false;

		if ( !scope.isLoaded ) {
			Api.sendRequest( '/web/dash/developer/games/packages/save/' + scope.formModel.game_id ).then( function( payload )
			{
				scope.isLoaded = true;

				if ( scope.method == 'add' ) {
					if ( payload.hasDefaultPackage ) {
						scope.formModel.title = '';
					}
					else {
						scope.formModel.title = scope.game.title;
					}
				}
				else {
					if ( !scope.formModel.title ) {
						scope.formModel.title = scope.game.title;
					}
				}
			} );
		}
		else {
			if ( !scope.formModel.title ) {
				scope.formModel.title = scope.game.title;
			}
		}
	};

	return form;
} );
