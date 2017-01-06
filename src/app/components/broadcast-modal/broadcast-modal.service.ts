import { Injectable, Inject } from 'ng-metadata/core';
import { BroadcastModalCtrl } from './broadcast-modal.controller';
import template from 'html!./broadcast-modal.html';
import { App } from '../../app-service';

const STORAGE_KEY_PREFIX = 'broadcast-modal:date:';

@Injectable()
export class BroadcastModal
{
	constructor(
		@Inject( '$window' ) private $window: ng.IWindowService,
		@Inject( '$modal' ) private $modal: any,
		@Inject( 'App' ) private app: App,
		@Inject( 'Api' ) private api: any,
	)
	{
	}

	private _key()
	{
		return STORAGE_KEY_PREFIX + this.app.user.id;
	}

	check()
	{
		// Bootstrap it from when this feature was launched.
		if ( !this.$window.localStorage[ this._key() ] && this.app.user.created_on < 1483566930963 ) {

			// Will try pulling articles since June 1st, 2016.
			this.$window.localStorage[ this._key() ] = 1464739200000;
		}

		this.api.sendRequest( '/web/broadcasts', { from: this.$window.localStorage[ this._key() ] } )
			.then( ( payload: any ) =>
			{
				if ( payload.broadcasts.length ) {
					this.show( payload.broadcasts );
				}
			} );

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
				posts: () =>
				{
					return posts;
				},
			}
		} );
	}
}
