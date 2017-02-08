import { Component, OnInit, Inject, Input, Output, EventEmitter } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./bundle.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { App } from '../../../app-service';

@Component({
	selector: 'route-key-bundle',
	template,
})
export class RouteBundleComponent implements OnInit
{
	@Input() payload: any;
	@Input() loginUrl: string;
	@Input() key?: string;

	@Output() private claim = new EventEmitter<any>();

	bundle: any;
	games: Game[];

	constructor(
		@Inject( '$state' ) public $state: StateService,
		@Inject( 'App' ) public app: App,
		@Inject( 'GameBundle' ) private bundleModel: any,
	)
	{
	}

	ngOnInit()
	{
		this.bundle = new this.bundleModel( this.payload.bundle );
		this.games = Game.populate( this.payload.games );

		Meta.title = `Key Page for ${this.bundle.title}`;
	}

	_claim()
	{
		this.claim.emit( this.bundle );
	}
}
