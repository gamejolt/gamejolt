import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppGameThumbnail } from './thumbnail';

@NgModule({
	declarations: [
		makeComponentProvider( AppGameThumbnail ),
	],
})
export class GameThumbnailModule { }
