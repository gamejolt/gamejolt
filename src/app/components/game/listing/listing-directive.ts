import { Component, Inject, Input } from 'ng-metadata/core';
import { StateService } from 'angular-ui-router';
import * as template from '!html-loader!./listing.html';

import { GameListingContainer } from './listing-container-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';

@Component({
	selector: 'gj-game-listing',
	template,
	legacy: {
		transclude: true,
	},
})
export class ListingComponent
{
	@Input( '<' ) listing: GameListingContainer;
	@Input( '<' ) showAds = false;
	@Input( '<' ) hideFilters = false;
	@Input( '<' ) hideSectionNav = false;
	@Input( '<' ) includeFeaturedSection = false;

	state: string;
	env = Environment;

	constructor(
		@Inject( '$state' ) $state: StateService,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'Scroll' ) public scroll: any,
	)
	{
		this.state = <string>$state.current.name;
	}
}
