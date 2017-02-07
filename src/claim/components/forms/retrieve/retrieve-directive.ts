import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

/*@ngInject*/
export function RetrieveComponent(
	Form: any,
)
{
	const form = new Form( {
		template: require( './retrieve.html' )
	} );

	form.scope.key = '@gjKey';
	form.scope.bundle = '=?gjBundle';
	form.scope.game = '=?gjGame';

	form.onInit = ( _scope: ng.IScope ) =>
	{
	};

	form.onSubmit = ( scope: ng.IScope ) =>
	{
		let url = '/claim/retrieve';
		if ( scope['bundle'] ) {
			url += '/bundle/' + scope['key'];
		}
		else if ( scope['game'] ) {
			url += '/game/' + scope['key'];
		}

		return Api.sendRequest( url, scope['formModel'] );
	};

	return form;
}
