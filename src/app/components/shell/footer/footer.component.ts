import { Component, Inject } from 'ng-metadata/core';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import template from 'html!./footer.component.html';

@Component({
	selector: 'gj-shell-footer',
	template,
})
export class ShellFooterComponent
{
	curDate = new Date();
	clientVersion?: string;

	constructor(
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$injector' ) private $injector: any,
		@Inject( 'Environment' ) public env: Environment,
	)
	{
		if ( this.env.isClient ) {
			const Client_Info = $injector.get( 'Client_Info' );
			this.clientVersion = Client_Info.getVersion();
		}
	}

	// We have to refresh the whole browser when language changes so that
	// all the new language strings get picked up.
	onLangChange()
	{
		if ( !this.env.isClient ) {
			this.$window.location.reload();
		}
		else {
			require( 'nw.gui' ).Window.get().reloadDev();
		}
	}

	showSystemReport()
	{
		if ( this.env.isClient ) {
			this.$injector.get( 'Client_SystemReportModal' ).show();
		}
	}

}
