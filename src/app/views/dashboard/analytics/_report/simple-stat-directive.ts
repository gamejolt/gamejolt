import { Component, Input } from 'ng-metadata/core';
import * as template from '!html-loader!./simple-stat.html';

@Component({
	selector: 'gj-analytics-report-simple-stat',
	template,
})
export class SimpleStatComponent
{
	@Input( '<' ) reportData: any;
}
