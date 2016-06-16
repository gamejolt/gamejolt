import { Component, Inject, Input } from 'ng-metadata/core';
import template from './page-header.html';

@Component({
	selector: 'gj-page-header',
	templateUrl: template,
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
