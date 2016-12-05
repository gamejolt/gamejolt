export function GameFormFactory(
	Form: any,
	Scroll: any,
	App: any
)
{
	const form = new Form( {
		model: 'Game',
		template: '/app/components/forms/dashboard/game/game.html',

		// We need this to reset all the "is published", "has builds" stuff.
		resetOnSubmit: true,
	} );

	form.scope.isWizard = '<';

	form.onInit = function( scope: any )
	{
		scope.App = App;

		// Reset values.
		scope.acceptedRules = scope.method != 'add';

		scope.onLoaded = ( payload: any ) => angular.extend( scope, payload );

		if ( scope.method == 'add' ) {
			scope.formModel.referrals_enabled = 1;
		}

		scope.stage = () =>
		{
			if ( !scope.acceptedRules ) {
				return 'rules';
			}
			else if ( angular.isUndefined( scope.formModel.development_status ) ) {
				return 'dev-status';
			}
			return 'details';
		};

		scope.acceptRules = () =>
		{
			scope.acceptedRules = true;
			Scroll.to( 0, { animate: false } );
		};
	};

	return form;
}
