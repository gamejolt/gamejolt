import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Loader } from '../../../../../../lib/gj-lib-client/components/loader/loader.service';

require( './build.styl' );

SiteBuildFormFactory.$inject = [ 'Form' ];
export function SiteBuildFormFactory(
	Form: any,
)
{
	const form = new Form( {
		model: 'SiteBuild',
		template: require( './build.html' ),
		resetOnSubmit: true,
	} );

	form.scope.site = '<';

	form.onInit = function( scope: any )
	{
		scope.Loader = Loader;
		Loader.load( 'upload' );

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

	form.onSubmit = function( scope: any )
	{
		return Api.sendRequest( `/web/dash/sites/upload-build/${scope.site.id}`, {}, {
			file: scope.formModel.file,
			progress: ( event ) => scope.formModel._progress = event,
		} );
	};

	return form;
}
