import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppGameFollowWidget } from './follow-widget';

@NgModule({
	declarations: [
		makeComponentProvider( AppGameFollowWidget ),
	],
})
export class GameFollowWidgetModule { }
