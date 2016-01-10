angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGamePackage', function( Form, Api, Game_Package )
{
	var form = new Form( {
		model: 'Game_Package',
		template: '/app/components/forms/dashboard/game/package/package.html',
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope )
	{
		scope.formModel.game_id = scope.game.id;

		if ( !scope.formModel.title ) {
			scope.formModel.title = scope.game.title;
		}

		scope.formState.showTitleInput = scope.method == 'edit' ? true : false;
		scope.formState.showDescriptionInput = scope.formModel.description ? true : false;

		if ( !scope.isLoaded ) {
			Api.sendRequest( '/web/dash/developer/games/packages/save/' + scope.formModel.game_id ).then( function( payload )
			{
				scope.isLoaded = true;

				// Check if there is a default package without a title already.
				// If so, then force them to enter a name.
				if ( scope.method == 'add' ) {
					if ( payload.hasDefaultPackage ) {
						scope.formModel.title = '';
						scope.formState.showTitleInput = true;
					}
				}
			} );
		}
	};

	return form;
} );
