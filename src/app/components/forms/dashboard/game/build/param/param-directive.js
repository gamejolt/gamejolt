angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameBuildParam', function( Form )
{
	var form = new Form( {
		model: 'Game_Build_Param',
		template: '/app/components/forms/dashboard/game/build/param/param.html',
		resetOnSubmit: true,
	} );

	form.scope.game = '=gjGame';
	form.scope.package = '=gjGamePackage';
	form.scope.release = '=gjGameRelease';
	form.scope.build = '=gjGameBuild';

	form.onInit = function( scope )
	{
		scope.formModel.game_id = scope.game.id;
		scope.formModel.game_package_id = scope.package.id;
		scope.formModel.game_release_id = scope.release.id;
		scope.formModel.game_build_id = scope.build.id;
	};

	return form;
} );
