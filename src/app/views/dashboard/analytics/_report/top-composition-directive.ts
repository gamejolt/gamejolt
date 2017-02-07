import { Component, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./top-composition.html';

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
