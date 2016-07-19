export function GameDescriptionFormFactory( Form: any )
{
	const form = new Form( {
		model: 'Game',
		template: '/app/components/forms/dashboard/game/description/description.html'
	} );

	form.scope.isWizard = '<';

	form.onInit = function()
	{
	};

	return form;
}
