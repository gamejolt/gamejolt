import { Component } from 'ng-metadata/core';
import * as template from '!html-loader!./footer.component.html';

import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';

@Component({
	selector: 'gj-shell-footer',
	template,
})
export class ShellFooterComponent
{
	curDate = new Date();
	clientVersion?: string;
	env = Environment;

	constructor()
	{
		if ( GJ_IS_CLIENT ) {
			const Client_Info = getProvider<any>( 'Client_Info' );
			this.clientVersion = Client_Info.getVersion();
		}
	}

	// We have to refresh the whole browser when language changes so that
	// all the new language strings get picked up.
	onLangChange()
	{
		if ( !GJ_IS_CLIENT ) {
			window.location.reload();
		}
		else {
			require( 'nw.gui' ).Window.get().reloadDev();
		}
	}

	showSystemReport()
	{
		if ( GJ_IS_CLIENT ) {
			getProvider<any>( 'Client_SystemReportModal' ).show();
		}
	}

}
