import { Component, Inject, Input } from 'ng-metadata/core';
import { App } from '../../../app-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import template from 'html!./account-popover.component.html';

@Component({
	selector: 'gj-shell-account-popover',
	template,
})
export class ShellAccountPopoverComponent
{
	@Input( '=' ) isShown = false;

	walletAmount: number | false = false;

	Client?: any;

	constructor(
		@Inject( '$injector' ) $injector: any,
		@Inject( 'App' ) public app: App,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'User_TokenModal' ) private User_TokenModal: any,
		@Inject( 'Connection' ) public conn: Connection,
		@Inject( 'Environment' ) public env: Environment,
	)
	{
		if ( env.isClient ) {
			this.Client = $injector.get( 'Client' );
		}
	}

	onShow()
	{
		this.isShown = true;
		this.getWallet();
	}

	onHide()
	{
		this.isShown = false;
	}

	logout()
	{
		this.app.logout();
	}

	showToken()
	{
		this.User_TokenModal.show();
	}

	getWallet()
	{
		this.api.sendRequest( '/web/dash/funds/wallet', { detach: true } )
			.then( ( response: any ) =>
			{
				this.walletAmount = response.amount;
			} );
	}
}
