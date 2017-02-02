GameDescriptionFormFactory.$inject = [ 'Form' ];
export function GameDescriptionFormFactory( Form: any )
{
	const form = new Form( {
		model: 'Game',
		saveMethod: '$saveDescription',
		template: require( './description.html' )
	} );

	form.scope.isWizard = '<';

	form.onInit = function( scope: any )
	{
		scope.$watchCollection( 'formState.serverErrors["autotag-fnaf"]', ( isFnafDetected: boolean ) =>
		{
			// This will make it so they can't edit the form and force them to choose if they want to tag or not.
			if ( isFnafDetected ) {
				scope.isFnafDetected = true;
				scope.isDisabled = true;
			}
		} );

		scope.addAutotag = ( tag: string ) =>
		{
			scope.formModel.autotag = tag;
			scope.onSubmit();
		};

		scope.skipAutotag = () =>
		{
			scope.formModel.autotag_skip = true;
			scope.onSubmit();
		};
	};

	return form;
}
