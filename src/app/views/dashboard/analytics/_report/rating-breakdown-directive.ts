import { Component, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./rating-breakdown.html';

@Component({
	selector: 'gj-analytics-report-rating-breakdown',
	template,
})
export class RatingBreakdownComponent
{
	@Input( '<' ) reportData: any;
}
