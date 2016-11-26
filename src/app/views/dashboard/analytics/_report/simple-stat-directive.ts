import { Component, Input } from 'ng-metadata/core';
import template from 'html!./simple-stat.html';

@Component({
	selector: 'gj-analytics-report-simple-stat',
	template,
})
export class SimpleStatComponent
{
	@Input( '<' ) reportData: any;
}
