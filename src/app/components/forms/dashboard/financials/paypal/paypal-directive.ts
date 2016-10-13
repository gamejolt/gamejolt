import { Component, Inject, Input } from 'ng-metadata/core';
import template from 'html!./paypal.html';

@Component({
	selector: 'gj-forms-dashboard-financials-paypal',
	template,
})
export class PaypalComponent
{
	@Input( '<' ) user: any;

	constructor(
		@Inject( '$q' ) private $q: ng.IQService,
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( 'gettextCatalog' ) private gettextCatalog: ng.gettext.gettextCatalog,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Environment' ) private env: any,
		@Inject( 'Growls' ) private growls: any,
	)
	{
	}

	linkPayPal()
	{
		this.api.sendRequest( '/web/dash/financials/get-paypal-auth', null, { detach: true } )
			.then( ( response: any ) =>
			{
				if ( !response || !response.authUrl ) {
					return this.$q.reject();
				}

				if ( this.env.isClient ) {
					require( 'nw.gui' ).Shell.openExternal( response.authUrl );
				}
				else {
					this.$window.location.href = response.authUrl;
				}
			} )
			.catch( () =>
			{
				this.growls.error( this.gettextCatalog.getString( 'Could not get PayPal redirect URL.' ) );
			} );
	}
}
