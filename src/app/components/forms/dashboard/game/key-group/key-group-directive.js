angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameKeyGroup', function( Form, KeyGroup, Game_Package )
{
	var form = new Form( {
		model: 'KeyGroup',
		template: require( './key-group.html' ),
		resetOnSubmit: true,
	} );

	form.scope.game = '=';
	form.scope.packages = '=';

	form.onInit = function( scope )
	{
		scope.KeyGroup = KeyGroup;
		scope.Game_Package = Game_Package;
		scope.formModel.game_id = scope.game.id;

		scope.formModel.packages = {};
		if ( scope.method == 'add' ) {
		}
		else if ( scope.method == 'edit' ) {
			angular.forEach( scope.baseModel.packages, function( _package )
			{
				scope.formModel.packages[ _package.id ] = true;
			} );
		}

		scope.arePackagesChosen = function()
		{
			for ( var i in scope.formModel.packages ) {
				if ( scope.formModel.packages[ i ] ) {
					return true;
				}
			}
			return false;
		};
	};

	form.onSubmitSuccess = function( scope, response )
	{
		if ( scope.game ) {
			scope.game.assign( response.game );
		}
	};

	return form;
} );
