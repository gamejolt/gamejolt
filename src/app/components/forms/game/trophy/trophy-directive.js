var Loader = require( '../../../../../../lib/gj-lib-client/components/loader/loader.service' ).Loader;

angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameTrophy', function( Form, Api, Game_Trophy, ModalConfirm, gettext, gettextCatalog )
{
	// Required for the upload label.
	gettext( 'dash.games.trophies.form.upload_label' );
	gettext( 'dash.games.trophies.form.change_image_label' );

	var form = new Form( {
		model: 'Game_Trophy',
		template: require( './trophy.html' ),
		resetOnSubmit: true,
	} );

	form.scope.game = '=gjGame';
	form.scope.trophy = '=gjTrophy';
	form.scope.difficulty = '=?trophyDifficulty';

	form.onInit = function( scope )
	{
		scope.Loader = Loader;
		Loader.load( 'upload' );

		// Set the game ID on the form model from the game passed in.
		scope.formModel.game_id = scope.game.id;
		scope.formModel.file = undefined;

		if ( !scope.isLoaded ) {
			Api.sendRequest( '/web/dash/developer/games/api/trophies/save/' + scope.formModel.game_id ).then( function( payload )
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );
			} );
		}

		scope.difficultyOptions = [
			{ label: gettextCatalog.getString( 'trophies.bronze' ), value: Game_Trophy.DIFFICULTY_BRONZE },
			{ label: gettextCatalog.getString( 'trophies.silver' ), value: Game_Trophy.DIFFICULTY_SILVER },
			{ label: gettextCatalog.getString( 'trophies.gold' ), value: Game_Trophy.DIFFICULTY_GOLD },
			{ label: gettextCatalog.getString( 'trophies.platinum' ), value: Game_Trophy.DIFFICULTY_PLATINUM },
		];

		// If we're adding, set some defaults.
		if ( scope.method === 'add' ) {
			scope.formModel.difficulty = scope.difficulty;
			scope.formModel.secret = false;
			scope.formModel.hidden = true;
		}
		else {
			scope.formModel.hidden = !scope.formModel.visible;
		}

		// Because of the fact that we store visible flag rather than hidden flag in DB,
		// we have to watch the hidden value and swap it into visible.
		scope.$watch( 'formModel.hidden', function( newVal )
		{
			scope.formModel.visible = !newVal;
		} );

		scope.clearImage = function()
		{
			ModalConfirm.show( gettextCatalog.getString( 'dash.games.trophies.form.clear_image_confirmation' ) )
				.then( function()
				{
					// It's important we save on the base model!
					// This way we don't overwrite the form model with the current values from the server.
					// They may have made changes and just want to clear the image and then save their form.
					// Doing it in this order allows them to do that.
					return scope.baseModel.$clearImage();
				} )
				.then( function()
				{
					// Copy just the differences that we want.
					scope.formModel.has_thumbnail = scope.baseModel.has_thumbnail;
					scope.formModel.img_thumbnail = scope.baseModel.img_thumbnail;
				} );
		};
	};

	return form;
} );
