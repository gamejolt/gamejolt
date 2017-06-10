import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppTrophyThumbnail } from './thumbnail';

@NgModule({
	declarations: [
		makeComponentProvider( AppTrophyThumbnail ),
	],
})
export class TrophyThumbnailModule { }
