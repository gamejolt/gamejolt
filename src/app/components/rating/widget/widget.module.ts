import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppRatingWidget } from './widget';

@NgModule({
	declarations: [
		makeComponentProvider( AppRatingWidget ),
	],
})
export class RatingWidgetModule { }
