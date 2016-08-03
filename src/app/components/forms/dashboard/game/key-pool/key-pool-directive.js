angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameKeyPool', function( Form, Game, Game_KeyPool )
{
	var form = new Form( {
		model: 'Game_KeyPool',
		saveMethod: '$import',
		template: '/app/components/forms/dashboard/game/key-pool/key-pool.html'
	} );

	form.scope.game = '=gjGame';
	form.scope.game_package = '=gjGamePackage';

	form.onInit = function( scope )
	{
		scope.formModel.game_id = scope.game.id;
		scope.formModel.game_package_id = scope.game_package.id;
		scope.formModel.provider = 'steam';
	};

	return form;
} );
