import { Component, Inject, Input } from 'ng-metadata/core';
import { Screen } from './../../../lib/gj-lib-client/components/screen/screen-service';
import template from './page-header.html';

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
	@Input( '<?' ) coverMediaItem: any;
	@Input( '<?' ) coverMaxHeight: number;
	@Input( '<?' ) shouldAffixNav: boolean;
	@Input( '@?' ) colClasses: string;

	hasCoverButtons = false;
	hasSpotlight = false;
	hasNav = false;
	hasControls = false;

	constructor(
		@Inject( '$transclude' ) $transclude: any,
		@Inject( 'Screen' ) private screen: Screen,
		@Inject( 'Scroll' ) private scroll: any
	)
	{
		this.hasCoverButtons = $transclude.isSlotFilled( 'coverButtons' );
		this.hasSpotlight = $transclude.isSlotFilled( 'spotlight' );
		this.hasNav = $transclude.isSlotFilled( 'nav' );
		this.hasControls = $transclude.isSlotFilled( 'controls' );
	}
}
