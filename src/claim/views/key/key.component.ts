import { Component, OnInit, Input, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./key.component.html';

import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { StateService, Transition } from 'angular-ui-router';
import { ModalConfirm } from '../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { App } from '../../app-service';

@Component({
	selector: 'route-key',
	template,
})
export class RouteKeyComponent implements OnInit
{
	@Input() payload: any;
	@Input() $transition$: Transition;

	key: string;
	type: string;

	loginUrl = Environment.authBaseUrl + '/login?redirect='
		+ encodeURIComponent( window.location.href );

	constructor(
		@Inject( '$state' ) private $state: StateService,
		@Inject( 'ModalConfirm' ) private confirm: ModalConfirm,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'App' ) private app: App,
	)
	{
	}

	ngOnInit()
	{
		this.key = this.$transition$.params().key;
		this.type = this.payload.type;

		if ( this.payload.type == 'bundle' ) {
			this.$state.go( 'key.bundle' );
		}
		else if ( this.payload.type == 'game' ) {
			this.$state.go( 'key.game' );
		}
		else if ( this.payload.type == 'bundle-game' ) {
			this.$state.go( 'key.game', {
				bundleGameId: this.$transition$.params().bundleGameId,
			} );
		}
	}

	async claim( resource: any )
	{
		const resourceName = this.type === 'bundle' ? 'bundle' : 'game';

		await this.confirm.show( `Claiming this ${resourceName} into your Library will allow you to access it through your Game Jolt account and invalidate this key page.` );

		try {
			await Api.sendRequest( '/web/library/claim-key', { key: this.key } );

			if ( this.type == 'bundle' ) {
				window.location.href = Environment.wttfBaseUrl + `/library/bundle/${resource.slug}/${resource.id}/games`;
			}
			else if ( this.type == 'game' ) {
				window.location.href = Environment.wttfBaseUrl + `/profile/${this.app.user.slug}/${this.app.user.id}/owned`;
			}
		}
		catch ( _e ) {
			this.growls.error( `For some reason we couldn't claim this into your account!` );
		}
	}
}
