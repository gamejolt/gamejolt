GameSketchfabFormFactory.$inject = [ 'Form' ];
export function GameSketchfabFormFactory(
	Form: any,
)
{
	const form = new Form( {
		model: 'GameSketchfab',
		template: require( './sketchfab.component.html' ),
		resetOnSubmit: true,
	} );

	form.scope.game = '=gjGame';

	form.onInit = function( scope: any )
	{
		scope.formModel.game_id = scope.game.id;
	};

	return form;
}
