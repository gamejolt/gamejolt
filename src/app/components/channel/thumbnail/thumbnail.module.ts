import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppChannelThumbnail } from './thumbnail';

@NgModule({
	declarations: [
		makeComponentProvider( AppChannelThumbnail ),
	],
})
export class ChannelThumbnailModule { }
