import { Component, Input, Inject } from 'ng-metadata/core';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import template from 'html!./mod-links.component.html';

@Component({
	selector: 'gj-game-mod-links',
	template,
})
export class GameModLinksComponent
{
	@Input( '<' ) game: any;

	constructor(
		@Inject( 'Environment' ) public env: Environment,
		@Inject( 'Api' ) private api: any,
		@Inject( 'Growls' ) public growls: any,
	)
	{
	}

	tag( tag: string )
	{
		// It won't return what site api expects for output, so gotta catch.
		this.api.sendRequest( `/games/tags/tag/${this.game.id}/${tag}`, null, { apiPath: '/moderate', processPayload: false } )
			.catch( () =>
			{
				this.growls.success( 'Tagged the game.' );
			} );
	}
}
