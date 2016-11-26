import { Component, Input } from 'ng-metadata/core';
import template from 'html!./top-composition.html';

@Component({
	selector: 'gj-analytics-report-top-composition',
	template,
})
export class TopCompositionComponent
{
	@Input( '<' ) reportData: any;

	getTypeof( obj: any )
	{
		return typeof obj;
	}
}
