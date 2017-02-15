import { Injectable, Inject } from 'ng-metadata/core';
import { BroadcastModalCtrl } from './broadcast-modal.controller';
import * as template from '!html-loader!./broadcast-modal.html';

import { App } from '../../app-service';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';

const STORAGE_KEY_PREFIX = 'broadcast-modal:date:';

@Injectable( 'BroadcastModal' )
export class BroadcastModal
{
	constructor(
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$modal' ) private $modal: any,
		@Inject( 'App' ) private app: App,
	)
	{
	}

	private _key()
	{
		return STORAGE_KEY_PREFIX + this.app.user!.id;
	}

	async check()
	{
		if ( !this.app.user ) {
			return;
		}

		// // Bootstrap it from when this feature was launched.
		// if ( !this.$window.localStorage[ this._key() ] && this.app.user.created_on < 1483566930963 ) {

		// 	// Will try pulling articles since June 1st, 2016.
			this.$window.localStorage[ this._key() ] = 1464739200000;
		// }

		const payload = await Api.sendRequest( '/web/broadcasts', { from: this.$window.localStorage[ this._key() ] } );

		if ( payload.broadcasts.length ) {
			this.show( payload.broadcasts );
		}

		this.$window.localStorage[ this._key() ] = Date.now();
	}

	private show( posts: any[] )
	{
		this.$modal.open( {
			controller: BroadcastModalCtrl,
			controllerAs: '$ctrl',
			template,
			backdrop: 'static',
			resolve: {

				posts: () => posts,
			}
		} );
	}
}
