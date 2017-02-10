import { Component, Input } from 'ng-metadata/core';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import * as template from '!html-loader!./featured.html';

@Component({
	selector: 'gj-discover-home-featured',
	template,
})
export class FeaturedComponent
{
	@Input( '<featuredItems' ) items: any[];

	itemsSmUp: any[];

	screen = Screen;

	constructor()
	{
		this.itemsSmUp = this.items.slice( 2 );
	}
}
