import { Component, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./account-popover.component.html';

import { App } from '../../../app-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

@Component({
	selector: 'gj-shell-account-popover',
	template,
})
export class ShellAccountPopoverComponent
{
	@Input( '=' ) isShown = false;

	walletAmount: number | false = false;

	Client?: any;
	env = Environment;
	screen = Screen;

	constructor(
		@Inject( 'App' ) public app: App,
		@Inject( 'User_TokenModal' ) private User_TokenModal: any,
		@Inject( 'Connection' ) public conn: Connection,
	)
	{
		if ( GJ_IS_CLIENT ) {
			this.Client = getProvider<any>( 'Client' );
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
		Api.sendRequest( '/web/dash/funds/wallet', { detach: true } )
			.then( ( response: any ) =>
			{
				this.walletAmount = response.amount;
			} );
	}
}
