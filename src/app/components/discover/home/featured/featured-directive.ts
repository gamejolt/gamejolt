import { Component, Inject, Input } from 'ng-metadata/core';
import { Screen } from './../../../../../lib/gj-lib-client/components/screen/screen-service';
import template from 'html!./featured.html';

@Component({
	selector: 'gj-discover-home-featured',
	template,
})
export class FeaturedComponent
{
	@Input( '<featuredItems' ) items: any[];

	itemsSmUp: any[];

	constructor(
		@Inject( 'Screen' ) public screen: Screen
	)
	{
		this.itemsSmUp = this.items.slice( 2 );
	}
}
