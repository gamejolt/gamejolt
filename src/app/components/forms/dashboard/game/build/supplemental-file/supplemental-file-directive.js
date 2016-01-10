angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameBuildSupplementalFile', function( Form, Api )
{
	var form = new Form( {
		model: 'Game_Build_File',
		template: '/app/components/forms/dashboard/game/build/supplemental-file/supplemental-file.html',
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

		scope.formModel.java_include_archive = true;
		scope.formModel.file = undefined;

		if ( !scope.isLoaded ) {
			var params = [
				scope.formModel.game_id,
				scope.formModel.game_package_id,
				scope.formModel.game_release_id,
				scope.formModel.game_build_id,
			];

			Api.sendRequest( '/web/dash/developer/games/builds/files/save/' + params.join( '/' ) ).then( function( payload )
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );
			} );
		}
	};

	return form;
} );
