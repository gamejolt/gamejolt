import { Component, OnInit, Inject, Input, Output, EventEmitter } from 'ng-metadata/core';
import { Transition } from 'angular-ui-router';
import * as template from '!html-loader!./game.component.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage, GamePackagePayload } from '../../../../lib/gj-lib-client/components/game/package/package.model';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { App } from '../../../app-service';

@Component({
	selector: 'route-key-game',
	template,
})
export class RouteGameComponent implements OnInit
{
	@Input() $transition$: Transition;
	@Input() payload: any;
	@Input() loginUrl: string;
	@Input() key?: string;

	@Output() private claim = new EventEmitter<Game>();

	showingThanks = false;
	isClaimOnly = false;

	game: Game;
	bundle?: any;
	keyGroup?: any;
	linkedKeys: any[] = [];

	packagePayload: GamePackagePayload;

	env = Environment;

	constructor(
		@Inject( 'Meta' ) private meta: Meta,
		@Inject( 'App' ) public app: App,
		@Inject( 'LinkedKey' ) public LinkedKey: any,
		@Inject( 'GameBundle' ) private bundleModel: any,
		@Inject( 'KeyGroup' ) private keyGroupModel: any,
	)
	{
		this.showingThanks = !!this.$transition$.params().thanks;
	}

	ngOnInit()
	{
		this.game = new Game( this.payload.game );
		this.bundle = this.payload.bundle ? new this.bundleModel( this.payload.bundle ) : null;
		this.keyGroup = this.payload.keyGroup ? new this.keyGroupModel( this.payload.keyGroup ) : null;

		if ( this.payload.type === 'game' ) {
			this.meta.title = `Key Page for ${this.game.title}`;
		}
		else if ( this.payload.type === 'bundle-game' ) {
			this.meta.title = `Key Page for ${this.game.title} in ${this.bundle.title}`;
		}

		if ( this.keyGroup && (this.keyGroup.type === this.keyGroupModel.TYPE_USER
			|| this.keyGroup.type === this.keyGroupModel.TYPE_ANONYMOUS_CLAIM) ) {
			this.isClaimOnly = true;
			return;
		}

		this.linkedKeys = this.LinkedKey.populate( this.payload.linkedKeys );

		if ( this.payload.packages && this.payload.packages.length ) {
			this.packagePayload = GamePackage.processPackagePayload( this.payload );
		}
	}

	_claim()
	{
		this.claim.emit( this.game );
	}
}
