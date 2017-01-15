export function SiteBuildFormFactory(
	Form: any,
	Api: any,
)
{
	const form = new Form( {
		model: 'SiteBuild',
		template: '/app/components/forms/dashboard/site/build/build.html',
		resetOnSubmit: true,
	} );

	form.scope.site = '<';

	form.onInit = function( scope: any )
	{
		scope.formModel.file = undefined;
		scope.formModel.site_id = scope.site.id;

		if ( !scope.isLoaded ) {
			Api.sendRequest( '/web/dash/sites/upload-build/' + scope.formModel.site_id )
				.then( ( payload: any ) =>
				{
					scope.isLoaded = true;
					scope.maxFilesize = payload.maxFilesize;
				} );
		}
	};

	return form;
}
