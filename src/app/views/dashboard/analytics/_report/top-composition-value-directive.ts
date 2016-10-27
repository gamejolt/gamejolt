import { Component, Input } from 'ng-metadata/core';
import template from 'html!./top-composition-value.html';

@Component({
	selector: 'gj-analytics-report-top-composition-value',
	template,
})
export class TopCompositionValueComponent
{
	@Input( '<' ) reportData: any;

	getTypeof( obj: any )
	{
		return typeof obj;
	}
}
