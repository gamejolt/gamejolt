export function GameFormFactory( Form, Api, Game, Scroll, App )
{
	const form = new Form( {
		model: 'Game',
		template: '/app/components/forms/dashboard/game/game.html',

		// We need this to reset all the "is published", "has builds" stuff.
		resetOnSubmit: true,
	} );

	form.scope.isWizard = '<';

	form.onInit = function( scope )
	{
		scope.App = App;

		// Reset values.
		scope.hasActiveBuilds = false;

		Api.sendRequest( '/web/dash/developer/games/save' + (scope.method == 'edit' ? '/' + scope.baseModel.id : '') )
			.then( payload =>
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );
			} );

		scope.acceptedRules = scope.method != 'add';

		scope.stage = _ =>
		{
			if ( !scope.acceptedRules ) {
				return 'rules';
			}
			else if ( angular.isUndefined( scope.formModel.development_status ) ) {
				return 'type';
			}
			return 'details';
		};

		scope.acceptRules = _ =>
		{
			scope.acceptedRules = true;
			Scroll.to( 0, { animate: false } );
		};

		scope.checkIsCompleteAllowed = _ =>
		{
			// If the form loaded in with the game published, but there are no builds yet, then they shouldn't be able to select Complete or Canceled.
			if ( scope.method == 'edit' && scope.baseModel.is_published && !scope.hasActiveBuilds ) {
				return false;
			}

			// If the form WAS hidden when the form loaded, but now they set it as "published", but there is no active builds,
			// then they shouldn't be able to select complete/canceled.
			if ( !scope.hasActiveBuilds && scope.formModel.status == Game.STATUS_VISIBLE ) {
				return false;
			}

			return true;
		};

		scope.checkIsPublishable = _ =>
		{
			// If the game is published already, then allow it to stay published.
			if ( scope.method == 'edit' && scope.baseModel.is_published ) {
				return true;
			}

			// If the form was loaded in and the server said it's not publishable, then don't allow them to publish it yet.
			if ( !scope.isPublishable ) {
				return false;
			}

			// If the game WAS a WIP without builds when the form loaded, they can try to publish it by setting it as
			// published and Finished all in one go.
			// This disables the "Published" status if they don't have active builds and they unselect WIP.
			if ( !scope.hasActiveBuilds && !scope.formModel._is_wip ) {
				return false;
			}

			return true;
		};

		scope.$watchCollection( 'formState.serverErrors["autotag-fnaf"]', isFnafDetected =>
		{
			// This will make it so they can't edit the form and force them to choose if they want to tag or not.
			if ( isFnafDetected ) {
				scope.isFnafDetected = true;
				scope.isDisabled = true;
			}
		} );

		scope.addAutotag = tag =>
		{
			scope.formModel.autotag = tag;
			scope.onSubmit();
		};

		scope.skipAutotag = _ =>
		{
			scope.formModel.autotag_skip = true;
			scope.onSubmit();
		};
	};

	return form;
}
