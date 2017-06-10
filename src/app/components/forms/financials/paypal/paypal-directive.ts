import { Component, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./paypal.html';

import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';

@Component({
	selector: 'gj-form-dashboard-financials-paypal',
	template,
})
export class PaypalComponent
{
	@Input( '<' ) user: any;

	constructor(
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
	)
	{
	}

	linkPayPal()
	{
		Api.sendRequest( '/web/dash/financials/get-paypal-auth', null, { detach: true } )
			.then( ( response: any ) =>
			{
				if ( !response || !response.authUrl ) {
					return Promise.reject( undefined );
				}

				if ( GJ_IS_CLIENT ) {
					require( 'nw.gui' ).Shell.openExternal( response.authUrl );
				}
				else {
					window.location.href = response.authUrl;
				}
			} )
			.catch( () =>
			{
				Growls.error( this.gettextCatalog.getString( 'Could not get PayPal redirect URL.' ) );
			} );
	}
}
