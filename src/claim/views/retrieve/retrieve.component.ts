import { Component, OnInit, Inject, Input } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./retrieve.component.html';

import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';

@Component({
	selector: 'route-retrieve',
	template,
})
export class RouteRetrieveComponent implements OnInit
{
	@Input() bootstrap: any;

	key: string;
	bundle?: any;
	game?: Game;
	resourceTitle = '';


	constructor(
		@Inject( '$state' ) private $state: StateService,
		@Inject( 'GameBundle' ) private bundleModel: any,
	)
	{
	}

	ngOnInit()
	{
		const payload = this.bootstrap.payload;
		this.key = this.bootstrap.key;
		this.bundle = payload.bundle ? new this.bundleModel( payload.bundle ) : undefined;
		this.game = payload.game ? new Game( payload.game ) : undefined;

		this.resourceTitle = '';
		if ( this.bundle ) {
			this.resourceTitle = this.bundle.title;
		}
		else if ( this.game ) {
			this.resourceTitle = this.game.title;
		}

		Meta.title = 'Retrieve Keys';
		if ( this.resourceTitle ) {
			Meta.title += ' for ' + this.resourceTitle;
		}
	}

	onSubmit()
	{
		this.$state.go( 'sent-key' );
	}
}
