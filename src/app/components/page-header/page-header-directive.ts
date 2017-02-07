import { Component, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./page-header.html';

import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';

@Component({
	selector: 'gj-page-header',
	template,
	legacy: {
		transclude: {
			coverButtons: '?gjPageHeaderCoverButtons',
			content: 'gjPageHeaderContent',
			spotlight: '?gjPageHeaderSpotlight',
			nav: '?gjPageHeaderNav',
			controls: '?gjPageHeaderControls',
		}
	},
})
export class PageHeaderComponent
{
	@Input( '<' ) coverMediaItem?: MediaItem;
	@Input( '<' ) coverMaxHeight?: number;
	@Input( '<' ) hideNav = false;
	@Input( '<' ) shouldAffixNav = false;
	@Input( '<' ) spotlightDark = false;
	@Input( '@' ) colClasses?: string;

	hasCoverButtons = false;
	hasSpotlight = false;
	hasNav = false;
	hasControls = false;

	constructor(
		@Inject( '$transclude' ) $transclude: any,
		@Inject( 'Screen' ) public screen: Screen,
	)
	{
		this.hasCoverButtons = $transclude.isSlotFilled( 'coverButtons' );
		this.hasSpotlight = $transclude.isSlotFilled( 'spotlight' );
		this.hasNav = $transclude.isSlotFilled( 'nav' );
		this.hasControls = $transclude.isSlotFilled( 'controls' );
	}
}
