import { Component, Inject, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./page-header.component.html';
import './page-header.styl';
import './page-header-content.styl';

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

	screen = Screen;

	constructor(
		@Inject( '$transclude' ) $transclude: any,
	)
	{
		this.hasCoverButtons = $transclude.isSlotFilled( 'coverButtons' );
		this.hasSpotlight = $transclude.isSlotFilled( 'spotlight' );
		this.hasNav = $transclude.isSlotFilled( 'nav' );
		this.hasControls = $transclude.isSlotFilled( 'controls' );
	}
}
