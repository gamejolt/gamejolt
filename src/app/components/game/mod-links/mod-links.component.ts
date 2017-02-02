import { Component, Input, Inject } from 'ng-metadata/core';
import * as template from '!html-loader!./mod-links.component.html';

import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

@Component({
	selector: 'gj-game-mod-links',
	template,
})
export class GameModLinksComponent
{
	@Input( '<' ) game: any;

	env = Environment;

	constructor(
		@Inject( 'Growls' ) public growls: any,
	)
	{
	}

	tag( tag: string )
	{
		// It won't return what site api expects for output, so gotta catch.
		Api.sendRequest( `/games/tags/tag/${this.game.id}/${tag}`, null, { apiPath: '/moderate', processPayload: false } )
			.catch( () =>
			{
				this.growls.success( 'Tagged the game.' );
			} );
	}
}
