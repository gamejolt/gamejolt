import { Component, Inject, Input } from 'ng-metadata/core';

@Component({
	selector: 'gj-page-header',
	templateUrl: '/app/components/page-header/page-header.html',
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
	@Input( '<?' ) shouldAffixNav: boolean;

	constructor(
		@Inject( 'Screen' ) private screen: any
	)
	{
	}
}
