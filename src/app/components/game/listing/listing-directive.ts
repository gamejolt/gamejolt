import { Component, Inject, Input } from 'ng-metadata/core';
import { GameListingContainer } from './listing-container-service';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import template from 'html!./listing.html';

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
	@Input( '<?' ) showAds = false;
	@Input( '<?' ) hideFilters = false;
	@Input( '<?' ) hideSectionNav = false;
	@Input( '<?' ) includeFeaturedSection = false;

	state: string;

	constructor(
		@Inject( '$state' ) $state: ng.ui.IStateService,
		@Inject( 'Screen' ) public screen: Screen,
		@Inject( 'Environment' ) public env: any,
		@Inject( 'Scroll' ) public scroll: any,
	)
	{
		this.state = <string>$state.current.name;
	}
}
